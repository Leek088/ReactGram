import "./EditProfile.css";

// Caminho da imagem do usuário
import { apiImageUser } from "../../utils/config";

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
    // Recupera os dados do usuário
    const fetchUser = async () => {
      dispatch(reset()); // Reseta os estados do userSlice
      dispatch(getUser(userId)); // Recupera os dados do usuário
    };

    fetchUser(); // Chama a função para recuperar os dados do usuário
  }, [dispatch, userId]);

  // Sempre que o usuário for alterado, atualiza os estados do componente
  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setBio(user.bio);
      if (user.profile_picture) {
        // Caminho da imagem do usuário no servidor
        setProfileImage(apiImageUser + "/" + user.profile_picture);
      } else {
        // Se não houver imagem, seta como null
        setProfileImage(null);
      }
    }
  }, [user]);

  // Função para lidar com a imagem de perfil
  const handleImageProfile = (e) => {
    const image = e.target.files[0]; // Pega a imagem do input
    setPreviewImage(image); // Atualiza a imagem de preview
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // Cancela o envio do formulário
  };

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
          {(profileImage || previewImage) && (
            <img
              className="profile-image"
              src={
                previewImage ? URL.createObjectURL(previewImage) : profileImage
              }
              alt={user.name}
            />
          )}
          <form onSubmit={handleSubmit}>
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
              <input type="file" onChange={handleImageProfile} />
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
            <input type="submit" value="Atualizar" />
          </form>
        </>
      )}
    </div>
  );
};

export default EditProfile;
