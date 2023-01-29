import {
  ChangeEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { NextPage } from "next";
import styles from "../styles/Home.module.css";
import { createWorker } from "tesseract.js";

export interface PageProps {
  data: number;
}

const Home: NextPage<PageProps> = ({ data }) => {
  const [ocr, setOcr] = useState<string>("");
  const [readedText, setReadedText] = useState<string>("");
  const [progress, setProgress] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const worker = useMemo(
    () =>
      createWorker({
        logger: (m) => {
          console.log(m);
          if (m.status === "recognizing text")
            setProgress(m.progress?.toFixed(2) * 100);
        },
      }),
    []
  );

  const doOCR = async (objURL: string) => {
    const awaitedWorker = await worker;
    await awaitedWorker.load();
    await awaitedWorker.loadLanguage("rus");
    await awaitedWorker.initialize("rus");
    const imageRec = await awaitedWorker.recognize(objURL);
    setReadedText(imageRec.data.text);
  };

  const handleUpload = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const fr = new FileReader();
    if (file) fr.readAsDataURL(file);

    fr.addEventListener("load", () => {
      const res = fr.result;
      setOcr(res as string);
    });
  }, []);

  const handleClearFile = useCallback(() => {
    if (fileInputRef && fileInputRef?.current) fileInputRef.current.value = "";
    setOcr("");
    setReadedText("");
  }, []);

  const handleRecognizeFile = useCallback(() => {
    ocr && doOCR(ocr);
  }, [ocr]);

  const handleFilter = (text: string): string[] =>
    text
      .split("\n")
      .filter((value) => value)
      .map((value) => value.replace(/[^а-яА-Я]/gi, "").toUpperCase());

  return (
    <div className="bg-slate-300">
      <h1 className="text-yellow-100">{data}</h1>
      <main className={styles.main}>
        <div className="flex flex-col justify-center gap-3">
          <div className="max-w-xs h-auto">
            <img src={ocr} />
          </div>

          <input
            ref={fileInputRef}
            onChange={handleUpload}
            type="file"
            accept="image"
          />

          <div className="flex gap-3 self-center">
            <button
              className="bg-slate-600 border-1 p-2 w-fit text-zinc-50"
              onClick={handleRecognizeFile}
            >
              Recognize
            </button>

            <button
              className="bg-slate-600 border-1 p-2 w-fit text-zinc-50"
              onClick={handleClearFile}
            >
              Clear File
            </button>
          </div>
        </div>

        <div className="whitespace-pre-wrap max-w-xs">
          {progress && <div>{`${progress} %`}</div>}
          {handleFilter(readedText).map((team, index) => (
            <p>
              {team} - {index + 1}
            </p>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Home;

export async function getServerSideProps() {
  const data = 123;
  return {
    props: { data }, // will be passed to the page component as props
  };
}
