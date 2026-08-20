import { useParams } from "react-router";

const Test = () => {
  const { pid } = useParams();
  return (
    <div>
      <h1>Test {pid}</h1>
    </div>
  );
};

export default Test;
