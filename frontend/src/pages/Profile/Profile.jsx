// Styles
import "./Profile.css";
// Config
import { apiImagePost, apiImageUser } from "../../utils/config";
// Router
import { Link, useParams, useNavigate } from "react-router-dom";
// React
import { useState, useEffect, useRef } from "react";
// Icons
import { BsFillEyeFill, BsPencilFill, BsXLg } from "react-icons/bs";
// Redux
import { useSelector, useDispatch } from "react-redux";
import { getPostsByUserId, reset } from "../../slices/postSlice";
// components
import Message from "../../components/Message";

const Profile = () => {
  const { id } = useParams(); // Id usuário passado por parametro
  const { user } = useSelector((state) => state.auth); // usuário logado
  const { posts, error, success, messageSuccess, loading } = useSelector(
    (state) => state.post
  ); // states iniciais do slice
  // states
  const [title, setTitle] = useState(""); // Titulo da foto
  const [editTitle, setEditTitle] = useState(""); // Titulo da foto editada
  const [editImage, setEditImage] = useState(""); // Imagem a ser editada

  const dispatch = useDispatch(); // Hook do redux para executar ações

  const newPostForm = useRef(); // Referência para o formulário de nova foto
  const editPostForm = useRef(); // Referência para o formulário de nova foto

  // Faz a requisição para recuperar os posts do usuário
  useEffect(() => {
    // Recupera os posts do usuário
    const fetchPosts = async () => {
      dispatch(reset()); // Reseta os estados do userSlice
      dispatch(getPostsByUserId(id)); // Recupera os dados do usuário
    };

    fetchPosts(); // Chama a função para recuperar os dados do usuário
  }, [dispatch, id]);

  if (loading) {
    return <p>Carregando...</p>;
  }

  const submitHandle = async (e) => {
    e.preventDefault(); // Previne o comportamento padrão do formulário
  };

  const handleUpdate = async (e) => {
    e.preventDefault(); // Previne o comportamento padrão do formulário
  };

  const handleCancelEdit = () => {};

  const handleFile = (e) => {
    const image = e.target.files[0]; // Recupera a imagem do input
    const formData = new FormData(); // Cria um novo objeto FormData
    formData.append("image", image); // Adiciona a imagem ao objeto FormData
    formData.append("title", title); // Adiciona o título ao objeto FormData

    // Chama a função para criar uma nova foto
    createPhoto(formData);
  };

  return (
    <div id="profile">
      <div className="profile-header">
        {user.profile_picture && (
          <img
            src={`${apiImageUser}/${user.profile_picture}`}
            alt={user.name}
          />
        )}
        <div className="profile-description">
          <h2>{user.name}</h2>
          <p>{user.bio}</p>
        </div>
      </div>
      {id == user.id && (
        <>
          <div className="new-photo" ref={newPostForm}>
            <h3>Compartilhe algum momento seu:</h3>
            <form onSubmit={submitHandle}>
              <label>
                <span>Título para a foto:</span>
                <input
                  type="text"
                  placeholder="Insira um título"
                  onChange={(e) => setTitle(e.target.value)}
                  value={title || ""}
                />
              </label>
              <label>
                <span>Imagem:</span>
                <input type="file" onChange={handleFile} />
              </label>
              {!loading && <input type="submit" value="Postar" />}
              {loading && <input type="submit" disabled value="Aguarde..." />}
            </form>
          </div>
          <div className="edit-photo hide" ref={editPostForm}>
            <p>Editando:</p>
            {editImage && (
              <img src={`${uploads}/photos/${editImage}`} alt={editTitle} />
            )}
            <form onSubmit={handleUpdate}>
              <input
                type="text"
                onChange={(e) => setEditTitle(e.target.value)}
                value={editTitle || ""}
              />
              <input type="submit" value="Atualizar" />
              <button className="cancel-btn" onClick={handleCancelEdit}>
                Cancelar edição
              </button>
            </form>
          </div>
          {error && <Message messages={error} type="error" />}
          {messageSuccess.length > 0 && (
            <Message messages={messageSuccess} type="success" />
          )}
        </>
      )}
      <div className="user-photos">
        <h2>Fotos publicadas:</h2>
        <div className="photos-container">
          {posts &&
            posts.map((post) => (
              <div className="post" key={post.id}>
                {post.post_image && (
                  <img
                    src={`${apiImagePost}/posts/${post.post_image}`}
                    alt={post.title}
                  />
                )}
                {id === user.id ? (
                  <div className="actions">
                    <Link to={`/posts/${photo._id}`}>
                      <BsFillEyeFill />
                    </Link>
                    <BsPencilFill onClick={() => handleEdit(photo)} />
                    <BsXLg onClick={() => handleDelete(photo._id)} />
                  </div>
                ) : (
                  <Link className="btn" to={`/photos/${photo._id}`}>
                    Ver
                  </Link>
                )}
              </div>
            ))}
          {posts.length === 0 && <p>Ainda não há fotos publicadas...</p>}
        </div>
      </div>
    </div>
  );
};

export default Profile;
