import { useState, useEffect } from "react";
import { db } from "./firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";
import "./App.css";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [storedPassword, setStoredPassword] = useState("");
  const [editingItem, setEditingItem] = useState(null);
  const [tempData, setTempData] = useState({});

  useEffect(() => {
    const checkAuth = async () => {
      const savedAuth = localStorage.getItem("adminAuth");
      if (savedAuth === "true") {
        setIsAuthenticated(true);
        return;
      }

      // Obtener contraseña desde Firestore
      const docRef = doc(db, "config", "admin");
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setStoredPassword(docSnap.data().adminPassword);
      } else {
        console.error("No se encontró la contraseña en Firestore.");
      }
    };

    checkAuth();
  }, []);

  const handleLogin = () => {
    if (passwordInput === storedPassword) {
      localStorage.setItem("adminAuth", "true");
      setIsAuthenticated(true);
    } else {
      alert("Contraseña incorrecta.");
    }
  };

  const startEditing = (item) => {
    setEditingItem(item.id);
    setTempData({ ...item });
  };

  const handleEditChange = (e) => {
    setTempData({
      ...tempData,
      [e.target.name]: e.target.value,
    });
  };

  const changeQuantity = (amount) => {
    setTempData((prev) => ({
      ...prev,
      cantidad: Math.max(0, Number(prev.cantidad) + amount), // Evita números negativos
    }));
  };

  const confirmEdit = async () => {
    await updateDoc(doc(db, "inventario", editingItem), tempData);
    setItems(items.map((item) => (item.id === editingItem ? tempData : item)));
    setEditingItem(null);
  };

  const cancelEdit = () => {
    setEditingItem(null);
    setTempData({});
  };

  const [items, setItems] = useState([]);
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    cantidad: "",
    estado: "",
    observaciones: "",
  });

  useEffect(() => {
    fetchItems();
  }, []);

  // Obtener datos de Firestore
  const fetchItems = async () => {
    const querySnapshot = await getDocs(collection(db, "inventario"));
    const itemsArray = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setItems(itemsArray);
  };

  // Manejar cambios en los inputs
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Agregar un nuevo item a Firestore
  const addItem = async (e) => {
    e.preventDefault();
    const docRef = await addDoc(collection(db, "inventario"), formData);
    setItems([...items, { id: docRef.id, ...formData }]);
    setFormData({
      nombre: "",
      descripcion: "",
      cantidad: "",
      estado: "",
      observaciones: "",
    });
  };

  // Eliminar un item de Firestore
  const deleteItem = async (id) => {
    await deleteDoc(doc(db, "inventario", id));
    setItems(items.filter((item) => item.id !== id));
  };

  return (
    <div className="flex-container">
      {!isAuthenticated ? (
        <div>
          <h1>Acceso Administrador</h1>
          <input
            type="password"
            placeholder="Ingresa la contraseña"
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
          />
          <button onClick={handleLogin}>Ingresar</button>
        </div>
      ) : (
        <>
          <h1>Inventario Laboratorio de Impresión 3D</h1>
          <form onSubmit={addItem} style={{ marginBottom: "20px" }}>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              placeholder="Nombre"
              required
            />
            <input
              type="text"
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              placeholder="Descripción"
              required
            />
            <input
              type="number"
              name="cantidad"
              value={formData.cantidad}
              onChange={handleChange}
              placeholder="Cantidad"
              required
            />
            <input
              type="text"
              name="estado"
              value={formData.estado}
              onChange={handleChange}
              placeholder="Estado"
              required
            />
            <input
              type="text"
              name="observaciones"
              value={formData.observaciones}
              onChange={handleChange}
              placeholder="Observaciones"
            />
            <button type="submit">Agregar</button>
          </form>
          <h2>Lista de Items</h2>
          {items.length === 0 ? (
            <p>No hay items en el inventario.</p>
          ) : (
            <ul>
              {items.map((item) => (
                <li key={item.id}>
                  {editingItem === item.id ? (
                    <>
                      <input
                        type="text"
                        name="nombre"
                        value={tempData.nombre}
                        onChange={handleEditChange}
                      />
                      <input
                        type="text"
                        name="descripcion"
                        value={tempData.descripcion}
                        onChange={handleEditChange}
                      />
                      <div className="quantity--container">
                        <button className="quantity--button" onClick={() => changeQuantity(-1)}>-</button>
                        <input
                          className="quantity--input"
                          type="number"
                          name="cantidad"
                          value={tempData.cantidad}
                          onChange={handleEditChange}
                          readOnly
                        />
                        <button className="quantity--button" onClick={() => changeQuantity(1)}>+</button>
                      </div>
                      <input
                        type="text"
                        name="estado"
                        value={tempData.estado}
                        onChange={handleEditChange}
                      />
                      <input
                        type="text"
                        name="observaciones"
                        value={tempData.observaciones}
                        onChange={handleEditChange}
                      />
                      <button className="confirm--button" onClick={confirmEdit}>Confirmar</button>
                      <button className="cancel--button" onClick={cancelEdit}>Cancelar</button>
                    </>
                  ) : (
                    <>
                      <p>
                        <strong>{item.nombre}</strong> - {item.descripcion}
                      </p>
                      <p>
                        Cantidad: {item.cantidad} | Estado: {item.estado} |
                        Observaciones: {item.observaciones}
                      </p>
                      <div className="options--container">
                        <button
                          className="edit--button"
                          onClick={() => startEditing(item)}
                        >
                          Editar
                        </button>
                        <button
                          className="delete--button"
                          onClick={() => deleteItem(item.id)}
                        >
                          Borrar
                        </button>
                      </div>
                    </>
                  )}
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}

export default App;
