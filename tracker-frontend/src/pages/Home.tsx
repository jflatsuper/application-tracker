import BaseTest from "../components/BasTest";
import heroImg from "../assets/hero.png";
import reactLogo from "../assets/react.svg";
import viteLogo from "../assets/vite.svg";

const Home = () => {
  return (
    <BaseTest heroImg={heroImg} reactLogo={reactLogo} viteLogo={viteLogo} />
  );
};

export default Home;
