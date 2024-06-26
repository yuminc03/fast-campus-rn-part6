import { useCallback, useEffect, useState } from 'react';
import CodePush, { DownloadProgress } from 'react-native-code-push';

const useCodePush = () => {
  const [progress, setProgress] = useState<DownloadProgress>();
  const [updating, setUpdating] = useState(true);

  const update = useCallback(async () => {
    try {
      // 업데이트가 존재하는지 확인
      await CodePush.sync(
        {
          installMode: CodePush.InstallMode.IMMEDIATE,
        },
        undefined,
        p => {
          setProgress(p);
        },
      );
    } finally {
      setUpdating(false);
    }
  }, []);

  useEffect(() => {
    update();
  }, [update]);

  return {
    progress,
    updating,
  };
};

export default useCodePush;
