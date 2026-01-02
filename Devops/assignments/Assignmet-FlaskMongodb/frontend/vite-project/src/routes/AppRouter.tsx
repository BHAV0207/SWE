import { BrowserRouter, Route, Routes } from "react-router-dom"
import FormPage from "../pages/FormPage"

const AppRouter = () => {
  return (
   <BrowserRouter>
      <Routes>
        <Route path="/" element={<FormPage></FormPage>}/>
        
      </Routes>
   </BrowserRouter>
  )
}

export default AppRouter