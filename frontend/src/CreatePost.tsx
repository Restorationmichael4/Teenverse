import { useState } from "react";
import axios from "axios";

export default function CreatePost() {
    const [content, setContent] = useState("");
    const [email] = useState(localStorage.getItem("email"));
    const [message, setMessage] = useState("");

    const handlePost = () => {
        axios.post("http://localhost:5000/create-post", { email, content })
            .then(res => setMessage(res.data.message))
            .catch(err => setMessage("Error posting"));
    };

    return (
        <div>
            <h2>Create Post</h2>
            <textarea onChange={(e) => setContent(e.target.value)} placeholder="What's on your mind?"></textarea>
            <button onClick={handlePost}>Post</button>
            <p>{message}</p>
        </div>
    );
}
