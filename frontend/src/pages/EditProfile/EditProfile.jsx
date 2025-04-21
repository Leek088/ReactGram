import "./EditProfile.css";

//components
import Message from "../../components/Message";

// Hooks
import { useEffect, useState } from "react";

// Redux
import { useSelector, useDispatch } from "react-redux";
import { getUser, reset } from "../../slices/userSlice";

const EditProfile = () => {
  // Dados do usuário (user)
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const [bio, setBio] = useState("");
  const [previewImage, setPreviewImage] = useState("");

  // dispatch para os métodos do userSlice
  const dispatch = useDispatch();

  // Selector para recupear os estados do userSlice
  const { user, loading, success, error } = useSelector((state) => state.user);

  // id do usuário logado
  const userId = JSON.parse(localStorage.getItem("user")).id;

  // Faz a requisição para recuperar os dados do usuário
  useEffect(() => {
    const fetchUser = async () => {
      dispatch(reset()); // Reseta os estados do userSlice
      dispatch(getUser("33")); // Recupera os dados do usuário
    };
    fetchUser();
  }, [dispatch, userId]);

  // Sempre que o usuário for alterado, atualiza os estados do componente
  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setProfileImage(user.profileImage);
      setBio(user.bio);
    }
  }, [user]);

  return (
    <div id="edit-profile">
      {loading && <p> Carregando...</p>}
      {error && <Message messages={error} type="error" />}
      {success && (
        <>
          <h2>Edite seus dados</h2>
          <p className="subtitle">
            Adicione uma imagem de perfil, e conte mais um pouco sobre você...
          </p>
          {/* {(user.profileImage || previewImage) && (
        <img
        className="profile-image"
        src={
          previewImage
          ? URL.createObjectURL(previewImage)
          : `${uploads}/users/${user.profileImage}`
          }
          alt={user.name}
          />
          )} */}
          <form>
            <input
              type="text"
              placeholder="Nome"
              onChange={(e) => setName(e.target.value)}
              value={name || ""}
            />
            <input
              type="email"
              placeholder="E-mail"
              disabled
              value={email || ""}
            />
            <label>
              <span>Imagem de Perfil:</span>
              <input type="file" />
            </label>
            <label>
              <span>Bio:</span>
              <input
                type="text"
                placeholder="Descrição do perfil"
                onChange={(e) => setBio(e.target.value)}
                value={bio || ""}
              />
            </label>
            <label>
              <span>Quer alterar sua senha?</span>
              <input
                type="password"
                placeholder="Digite sua nova senha..."
                onChange={(e) => setPassword(e.target.value)}
                value={password || ""}
              />
            </label>
          </form>
        </>
      )}
    </div>
  );
};

export default EditProfile;
