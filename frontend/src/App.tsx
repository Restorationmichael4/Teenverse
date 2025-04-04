import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Register from "./Register";
import Login from "./Login";

export default function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Register />} />
                <Route path="/login" element={<Login />} />
            </Routes>
        </Router>
    );
}

import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import CoinFlip from "./pages/CoinFlip";

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/coin-flip" element={<CoinFlip userId={1} />} />
            </Routes>
        </Router>
    );
}

export default App;
