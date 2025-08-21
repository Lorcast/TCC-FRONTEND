import { useState, useEffect } from "react";

export const useManifestacao = (url) => {
   const [manifestacao, setManifestacao] = useState([]);

   useEffect(() => {

    const res = fetch(url)
    const data = res.json()

    setManifestacao(data);
   }, [url]);

   console.log(manifestacao);

  
};
