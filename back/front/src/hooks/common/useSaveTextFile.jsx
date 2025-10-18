import { useRef, useEffect } from 'react';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';

const isNative = Capacitor.isNativePlatform();

const useSaveTextFile = (text, questionInfo, downloadLinkRef) => {
  useEffect(() => {
    if (!isNative) {
      const textContent = text;
      const currentDate = new Date();
      const formatter = new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
      const formattedDate = formatter.format(currentDate);
      const date = formattedDate.split(',')[0].split('/').reverse().join('-');
      const time = formattedDate.split(',')[1].split(':').join('');
      const rearrangedDate = date + ' ' + time;
      const filename = `${rearrangedDate + ' ' + questionInfo?.question}.txt`;
      const dataUri = `data:text/plain;charset=utf-8,${encodeURIComponent(
        textContent
      )}`;
      const downloadLink = downloadLinkRef.current;
      if (downloadLink) {
        downloadLink.href = dataUri;
        downloadLink.download = filename;
      }
    }
  }, [text, questionInfo]);

  const handleDownload = async () => {
    if (isNative) {
      try {
        const currentDate = new Date();
        const formatter = new Intl.DateTimeFormat('en-US', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        });
        const formattedDate = formatter.format(currentDate);
        const date = formattedDate.split(',')[0].split('/').reverse().join('-');
        const time = formattedDate.split(',')[1].split(':').join('');
        const rearrangedDate = date + ' ' + time;
        const questionTitle =
          questionInfo?.question?.length > 30
            ? questionInfo?.question.slice(0, 30)
            : questionInfo?.question;
        const filename = `${rearrangedDate + ' ' + questionTitle}.txt`;

        // 파일명에서 일부 특수문자만 변경
        const safeFilename = filename
          .replace(/[\\/:*?"<>|]/g, '_') // 파일시스템에서 금지된 문자만 변경
          .replace(/\s+/g, ' '); // 연속된 공백은 하나로

        await Filesystem.writeFile({
          path: `Download/${safeFilename}`,
          data: text,
          directory: Directory.ExternalStorage,
          encoding: 'utf8',
        });
        // alert('파일이 다운로드 폴더에 저장되었습니다.');
      } catch (error) {
        alert('파일 저장에 실패했습니다: ' + error.message);
        console.error('파일 저장 실패:', error);
      }
    } else {
      const downloadLink = downloadLinkRef.current;
      if (downloadLink) {
        downloadLink.click();
      }
    }
  };

  return handleDownload;
};

export default useSaveTextFile;
