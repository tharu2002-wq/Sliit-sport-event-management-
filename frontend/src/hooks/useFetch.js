import { useCallback, useEffect, useState } from "react";

const useFetch = (fetcher, immediate = true) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState("");

  const execute = useCallback(async (...args) => {
    setLoading(true);
    setError("");
    try {
      const response = await fetcher(...args);
      setData(response);
      return response;
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Something went wrong");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetcher]);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);

  return { data, loading, error, execute, setData };
};

export default useFetch;
