import { BrowserRouter, Route, Routes } from "react-router-dom";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<h1>TaskFlow</h1>}/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;