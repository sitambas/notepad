import Notepad from "@/components/Notepad";
import { useParams } from "react-router-dom";

const IndexID = () => {
  console.log("IndexID");
  const { id } = useParams<{ id: string }>();
  return <Notepad noteId={id} />;
};

export default IndexID;