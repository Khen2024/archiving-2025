"use client"
import { loadPage } from "loader-lib";
import "@/utils/initTemplateLoaders";
import { useEffect, useState } from "react";
import { ContentPanel, useContent } from "seti-ramesesv1";

type PageProps = {
    params: {
        tenant: string;
        module: string;
    };
};

const  Home = ({params} :PageProps) =>{
    const module = params.module;

  const [target] = useState<any>("root");
  const {setContent} = useContent ();

  const loadTemplate = async () => {
    const page = await loadPage({
      page: "archiving",
      target: target,
    });
   
    setContent (target, () => page);  
  };

  useEffect (()=> {
    
    loadTemplate()
},[])
  return (


    <div>
      <ContentPanel id ={target}/>
    </div>
    
  );
}

export default Home
