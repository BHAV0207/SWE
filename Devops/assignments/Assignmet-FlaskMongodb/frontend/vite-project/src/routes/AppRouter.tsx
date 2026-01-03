import { BrowserRouter, Route, Routes } from "react-router-dom"
import FormPage from "../pages/FormPage"
import DataPage from "../pages/DataPage"
import MessagePage from "../pages/MessagePage"

const AppRouter = () => {
  return (
   <BrowserRouter>
      <Routes>
        <Route path="/" element={<FormPage></FormPage>}/>
        <Route path="/data" element={<DataPage></DataPage>}/>
        <Route path="/success" element={<MessagePage></MessagePage>}/>
      </Routes>
   </BrowserRouter>
  )
}

export default AppRouter