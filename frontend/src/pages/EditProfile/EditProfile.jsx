import "./EditProfile.css";

// Caminho da imagem do usuário
import { apiImageUser } from "../../utils/config";

//components
import Message from "../../components/Message";

// Hooks
import { useEffect, useState } from "react";

// Redux
import { useSelector, useDispatch } from "react-redux";
import { getUser, updateUser, reset } from "../../slices/userSlice";

const EditProfile = () => {
  // Dados do usuário (user)
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password_confirmation, setPasswordConfirmation] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const [previewImage, setPreviewImage] = useState("");

  // dispatch para os métodos do userSlice
  const dispatch = useDispatch();

  // Selector para recupear os estados do userSlice
  const { user, loading, success, updateSucess, error } = useSelector(
    (state) => state.user
  );

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

  // Função para lidar com o envio do formulário e atualizar o usuário
  const handleSubmit = async (e) => {
    e.preventDefault(); // Cancela o envio do formulário

    const formData = new FormData(); // Cria um novo objeto FormData
    // formData.append("_method", "PUT"); // Adiciona o método PUT ao FormData
    formData.append("_method", "PUT"); // Adiciona o nome ao FormData
    formData.append("name", name); // Adiciona o nome ao FormData
    // se o usuário digitar uma nova senha, adiciona ao FormData
    if (password) {
      formData.append("password", password); // Adiciona a senha ao FormData
      formData.append("password_confirmation", password_confirmation); // Adiciona a confirmação da senha ao FormData
    }
    // Se o usuário selecionou uma imagem, adiciona ao FormData
    if (previewImage) {
      formData.append("image", previewImage); // Adiciona a imagem de perfil ao FormData
    }
    // Reseta os estados do userSlice
    dispatch(reset());
    // Atualiza os dados do usuário
    dispatch(updateUser({ id: userId, data: formData })); // Chama a função para atualizar os dados do usuário
  };

  return (
    <div id="edit-profile">
      {error && <Message messages={error} type="error" />}
      {updateSucess && (
        <div className="msg-success">Usuário atualizado com sucesso.</div>
      )}
      {loading && <p> Carregando...</p>}
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
            <hr />
            <label>
              <span>Quer alterar sua senha?</span>
              <input
                type="password"
                placeholder="Digite sua nova senha..."
                onChange={(e) => setPassword(e.target.value)}
                value={password || ""}
              />
            </label>
            <label>
              <span>Confirme a senha</span>
              <input
                type="password"
                placeholder="Confirme sua senha..."
                onChange={(e) => setPasswordConfirmation(e.target.value)}
                value={password_confirmation || ""}
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
