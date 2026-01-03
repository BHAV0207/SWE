import React from "react";
import { useNavigate } from "react-router-dom";

const FormPage = () => {
  const [formData, SetformData] = React.useState({
    name: "",
    email: "",
    age: "",
  });
  const [error, setError] = React.useState("");
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    SetformData((prevData) => {
      return { ...prevData, [e.target.name]: e.target.value };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("http://localhost:5000/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
        return;
      }

      // ✅ Redirect on success
      navigate("/success");
    } catch (err) {
      setError("Failed to submit form");
    }
  };
  return (
    <section className="w-full min-h-screen">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col w-1/2 mx-auto mt-10 p-5 border border-gray-300 rounded-lg shadow-lg"
      >
        <label>Name</label>
        <input
          type="text"
          name="name"
          placeholder="Enter your name"
          value={formData.name}
          onChange={handleChange}
        />
        <label>Email</label>
        <input
          type="email"
          name="email"
          placeholder="Enter your email"
          value={formData.email}
          onChange={handleChange}
          className="border p-2"
        />

        <label>Age</label>
        <input
          type="number"
          name="age"
          placeholder="Enter your age"
          value={formData.age}
          onChange={handleChange}
          className="border p-2"
        />

        <button
          type="submit"
          className="border px-4 py-2 mt-2 hover:bg-black hover:text-white"
        >
          Submit
        </button>
      </form>
    </section>
  );
};

export default FormPage;
