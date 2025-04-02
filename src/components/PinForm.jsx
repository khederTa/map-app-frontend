import React, { useState } from "react";

const PinForm = ({ initialData = {}, onSubmit, onCancel }) => {
  const [title, setTitle] = useState(initialData.title || "");
  const [desc, setDesc] = useState(initialData.desc || "");
  const [star, setStar] = useState(initialData.rating || 1);
  const [files, setFiles] = useState(null);

  const handleFileChange = (e) => {
    setFiles(e.target.files);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Pass form data to the parent
    onSubmit({ title, desc, rating: star, files });
  };

  return (
    <div className="card" style={{ padding: "20px"}}>
      <form onSubmit={handleSubmit}>
        <label>Title</label>
        <input
          placeholder="Enter a title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <label>Description</label>
        <textarea
          placeholder="Say something about this place."
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
        />
        <label>Rating</label>
        <select value={star} onChange={(e) => setStar(Number(e.target.value))}>
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
          <option value="4">4</option>
          <option value="5">5</option>
        </select>
        <label>Media Files</label>
        <input
          class="file-input"
          type="file"
          multiple
          onChange={handleFileChange}
        />
        {onCancel && (
          <button className="secondaryButton" type="button" onClick={onCancel}>
            Cancel
          </button>
        )}
        <button className="submitButton" type="submit">
          Submit
        </button>
      </form>
    </div>
  );
};

export default PinForm;
