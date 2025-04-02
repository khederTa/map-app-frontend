import "./App.css";
import Map, { Marker, Popup } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import { useEffect, useState } from "react";
import StarIcon from "@mui/icons-material/Star";
import RoomIcon from "@mui/icons-material/Room";
import axios from "axios";
import { format } from "timeago.js";
import Register from "./components/Register";
import Login from "./components/Login";
import { useAuthStore } from "./store/authStore";
import LoadingSpinner from "./components/LoadingSpinner";
import PinForm from "./components/PinForm";
import { arrayToBase64 } from "./utils/arrayToBase64";

const TOKEN = import.meta.env.VITE_MAP_BOX_ACCESS_TOKEN
function App() {
  const { isCheckingAuth, checkAuth, isAuthenticated, logout, user } =
    useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const [pins, setPins] = useState([]);
  const [currentPlaceId, setCurrentPlaceId] = useState(null);
  const [newPlace, setNewPlace] = useState(null);
  // State to handle edit mode: holds the pin being edited
  const [editingPin, setEditingPin] = useState(null);

  // View state for Mapbox
  const initialViewState = {
    lat: 47.040182,
    lng: 17.071727,
    zoom: 4,
  };
  const [viewState, setViewState] = useState(initialViewState);
  const [showRegister, setShowRegister] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  // When a marker is clicked, open the popup
  const handleMarkerClick = (id, lat, long) => {
    setCurrentPlaceId(id);
    setViewState({ ...viewState, lat: lat, lng: long });
  };

  // For adding a new pin on double click
  const handleAddClick = (e) => {
    const { lng, lat } = e.lngLat;
    setNewPlace({ lat, lng });
  };

  // Submit handler for creating a new pin using PinForm
  const handleAddPin = async (formData) => {
    const data = new FormData();
    data.append("username", user?.username || "Anonymous");
    data.append("title", formData.title);
    data.append("desc", formData.desc);
    data.append("rating", formData.rating);
    data.append("lat", newPlace.lat);
    data.append("lng", newPlace.lng);

    if (formData.files && formData.files.length > 0) {
      for (const file of formData.files) {
        data.append("media", file);
      }
    }

    try {
      const res = await axios.post("http://localhost:5000/api/pins", data, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });
      setPins((prevPins) => [...prevPins, res.data]);
      setNewPlace(null);
    } catch (err) {
      console.log(err);
    }
  };

  // Submit handler for editing a pin (assuming a PUT endpoint exists)
  const handleEditPin = async (formData) => {
    const data = new FormData();
    data.append("title", formData.title);
    data.append("desc", formData.desc);
    data.append("rating", formData.rating);

    if (formData.files && formData.files.length > 0) {
      for (const file of formData.files) {
        data.append("media", file);
      }
    }

    try {
      const res = await axios.put(
        `http://localhost:5000/api/pins/${editingPin._id}`,
        data,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        }
      );
      // Update the pins state by replacing the edited pin
      setPins((prevPins) =>
        prevPins.map((pin) => (pin._id === editingPin._id ? res.data : pin))
      );
      setEditingPin(null);
      setCurrentPlaceId(null);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    const getPins = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/pins");
        const pinsData = Array.isArray(response.data)
          ? response.data
          : response.data.pins || [];
        setPins(pinsData);
      } catch (err) {
        console.log(err);
      }
    };
    getPins();
  }, []);

  const handleLogout = async () => {
    await logout();
  };

  if (isCheckingAuth) return <LoadingSpinner />;

  return (
    <div style={{ height: "100vh", width: "100%" }}>
      <Map
        initialViewState={{
          longitude: viewState.lng,
          latitude: viewState.lat,
          zoom: viewState.zoom,
        }}
        style={{ width: "100%", height: "100%" }}
        mapStyle="mapbox://styles/safak/cknndpyfq268f17p53nmpwira"
        mapboxAccessToken={TOKEN}
        onMove={(evt) => setViewState(evt.viewState)}
        onDblClick={isAuthenticated ? handleAddClick : undefined}
        transitionDuration={200}
      >
        {pins.map((p) => (
          <div key={p._id}>
            <Marker
              latitude={p.lat}
              longitude={p.lng}
              offsetLeft={-3.5 * viewState.zoom}
              offsetTop={-7 * viewState.zoom}
            >
              <RoomIcon
                style={{
                  fontSize: 7 * viewState.zoom,
                  color:
                    user && user.username === p.username
                      ? "tomato"
                      : "slateblue",
                  cursor: "pointer",
                }}
                onClick={() => handleMarkerClick(p._id, p.lat, p.lng)}
              />
            </Marker>
            {p._id === currentPlaceId && (
              <Popup
                latitude={p.lat}
                longitude={p.lng}
                closeButton={true}
                closeOnClick={false}
                onClose={() => {
                  setCurrentPlaceId(null);
                  setEditingPin(null);
                }}
                anchor="left"
              >
                <div className="card">
                  <div>
                    <label>Title</label>
                    <h4 className="place">{p.title}</h4>
                    <label>Description</label>
                    <p className="desc">{p.desc}</p>
                    <label>Rating</label>
                    <div className="stars">
                      {Array.from({ length: p.rating }).map((_, i) => (
                        <StarIcon key={i} className="star" />
                      ))}
                    </div>
                    <label>Information</label>
                    <span className="username">
                      Created by <b>{p.username}</b>
                    </span>
                  </div>
                  <span className="date">{format(p.createdAt)}</span>
                  {p.medias && p.medias.length > 0 && (
                    <div className="mediaPreview">
                      {p.medias.map((m) => {
                        if (!m.fileData || !m.fileData.data) {
                          return null;
                        }
                        // Convert stored fileData (an object with data property) to a base64 string.
                        // This assumes m.fileData is an object like: { type: 'Buffer', data: [...] }
                        const base64String = arrayToBase64(m.fileData.data);
                        const src = `data:${m.contentType};base64,${base64String}`;

                        return (
                          <div key={m._id} className="mediaItem">
                            {m.type === "image" ? (
                              <img
                                src={src}
                                alt={m.fileName}
                                style={{ width: "100px" }}
                              />
                            ) : m.type === "video" ? (
                              <video
                                src={src}
                                controls
                                style={{ width: "100px" }}
                              />
                            ) : (
                              <p>{m.fileName}</p>
                            )}
                            {/* Download button uses the dedicated download endpoint */}
                            <a
                              href={`http://localhost:5000/api/media/${m._id}`}
                              download={m.fileName}
                              className="secondaryButton"
                            >
                              Download
                            </a>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* If current user created the pin, show the Edit button */}
                  {user && user.username === p.username && (
                    <button
                      className="submitButton"
                      onClick={() => setEditingPin(p)}
                    >
                      Edit
                    </button>
                  )}
                </div>
              </Popup>
            )}
          </div>
        ))}

        {/* Popup for adding a new pin */}
        {newPlace && (
          <Popup
            latitude={newPlace.lat}
            longitude={newPlace.lng}
            closeButton={true}
            closeOnClick={false}
            onClose={() => setNewPlace(null)}
            anchor="left"
          >
            <PinForm
              onSubmit={handleAddPin}
              onCancel={() => setNewPlace(null)}
            />
          </Popup>
        )}

        {/* Popup for editing an existing pin */}
        {editingPin && (
          <Popup
            latitude={editingPin.lat}
            longitude={editingPin.lng}
            closeButton={true}
            closeOnClick={false}
            onClose={() => setEditingPin(null)}
            anchor="left"
          >
            <div>
              <PinForm
                initialData={{
                  title: editingPin.title,
                  desc: editingPin.desc,
                  rating: editingPin.rating,
                }}
                onSubmit={handleEditPin}
                onCancel={() => setEditingPin(null)}
              />
            </div>
          </Popup>
        )}

        {isAuthenticated ? (
          <button className="button logout" onClick={handleLogout}>
            Log out
          </button>
        ) : (
          <div className="buttons">
            <button
              className="button login"
              onClick={() => {
                setShowLogin(true);
                setShowRegister(false);
              }}
            >
              Log in
            </button>
            <button
              className="button register"
              onClick={() => {
                setShowRegister(true);
                setShowLogin(false);
              }}
            >
              Register
            </button>
          </div>
        )}
        {showRegister && (
          <Register
            setShowRegister={setShowRegister}
            setShowLogin={setShowLogin}
          />
        )}
        {showLogin && (
          <Login
            setShowLogin={setShowLogin}
            setShowRegister={setShowRegister}
          />
        )}
      </Map>
    </div>
  );
}

export default App;
