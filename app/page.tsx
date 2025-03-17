import axios from "axios";

export default async function Home() {

  axios.get("http://localhost:3000/api/reports/summary");

  return (
    <div>
      <h1>Home</h1>
    </div>
  );
}
