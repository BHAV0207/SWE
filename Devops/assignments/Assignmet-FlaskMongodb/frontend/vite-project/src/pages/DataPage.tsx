import React, { useEffect, useState } from "react";

const DataPage = () => {
  const [data, setData] = useState<any[]>([]);
  const [error, setError] = useState("");

  useEffect(()=>{
    const fetchData = async() => {
      try{
        const response = await fetch("http://localhost:5000/api");
        if(!response.ok){
          throw new Error("Network response was not ok");
        }
        const result = await response.json();
        setData(result);  

      }catch{
        setError("Failed to fetch data");
      }
    }

    fetchData();
  })


return (
  <div>
      <h2>Data from MongoDB</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <ul>
        {data.map((item) => (
          <li key={item._id}>
            {item.name} - {item.email} - {item.age}
          </li>
        ))}
      </ul>

      <button>GET ALL DATA</button>
    </div>
)
};

export default DataPage;
