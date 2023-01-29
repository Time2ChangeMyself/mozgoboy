import { ChangeEvent, useCallback, useEffect, useRef, useState } from "react";
import type { NextPage } from "next";
import styles from "../styles/Home.module.css";
import { createWorker } from "tesseract.js";

export interface PageProps {
  data: number;
}
const worker = createWorker({
  logger: (m) => console.log(m),
});

const Home: NextPage<PageProps> = ({ data }) => {
  const [ocr, setOcr] = useState<string>("");
  const [readedText, setReaadedText] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const doOCR = async (objURL: string) => {
    const awaitedWorker = await worker;
    await awaitedWorker.load();
    await awaitedWorker.loadLanguage("rus");
    await awaitedWorker.initialize("rus");
    const imageRec = await awaitedWorker.recognize(objURL);
    console.log("end", imageRec.data);
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
  }, []);

  const handleRecognizeFile = useCallback(() => {
    ocr && doOCR(ocr);
  }, [ocr]);

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <h1 className="text-yellow-100">{data}</h1>

        <img className="w-82 h-auto" src={ocr} />

        <button
          className="bg-slate-400 border-1 p-2 "
          onClick={handleRecognizeFile}
        >
          Recognize
        </button>

        <input
          ref={fileInputRef}
          onChange={handleUpload}
          type="file"
          accept="image"
        />

        <button
          className="bg-slate-400 border-1 p-2 "
          onClick={handleClearFile}
        >
          Clear File
        </button>
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
