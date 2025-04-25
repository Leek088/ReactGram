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
import { getPostsByUserId, createPost, reset } from "../../slices/postSlice";
import { getUser } from "../../slices/userSlice";
// components
import Message from "../../components/Message";

const Profile = () => {
  const { id } = useParams(); // Id usuário passado por parametro
  const userLogged = JSON.parse(localStorage.getItem("user")); // Recupera o usuário logado do localStorage

  // states iniciais do slice user
  const { user } = useSelector((state) => state.user);
  // states iniciais do slice post
  const { posts, error, messageSuccess, loading } = useSelector(
    (state) => state.post
  );
  // states para o formulário de novo post
  const [title, setTitle] = useState(""); // Titulo do post
  const [bio, setBio] = useState(""); // Biografia do post
  const [imagePost, setImagePost] = useState(null); // Imagem do post

  // states para o formulário de edição de post
  const [editTitle, setEditTitle] = useState(""); // Titulo da foto editada
  const [editImage, setEditImage] = useState(""); // Imagem a ser editada

  const dispatch = useDispatch(); // Hook do redux para executar ações

  const newPostForm = useRef(); // Referência para o formulário de nova foto
  const editPostForm = useRef(); // Referência para o formulário de nova foto

  useEffect(() => {
    // Recupera o usuário pelo id
    const fetchUser = async () => {
      dispatch(getUser(id)); // Recupera os dados do usuário
    };
    fetchUser(); // Chama a função para recuperar os dados do usuário
  }, [dispatch, id]);

  // Faz a requisição para recuperar os posts do usuário
  useEffect(() => {
    // Recupera os posts do usuário
    const fetchPosts = async () => {
      dispatch(reset()); // Reseta os estados do userSlice
      dispatch(getPostsByUserId(id)); // Recupera os dados do usuário
    };

    fetchPosts(); // Chama a função para recuperar os dados do usuário
  }, [dispatch, id]);

  const submitHandle = async (e) => {
    e.preventDefault(); // Previne o comportamento padrão do formulário
    const formData = new FormData(); // Cria um novo objeto FormData
    if (imagePost) {
      formData.append("image", imagePost); // Adiciona a imagem ao objeto FormData
    }
    formData.append("title", title); // Adiciona o título ao objeto FormData
    formData.append("bio", bio); // Adiciona o título ao objeto FormData
    formData.append("user_id", user.id); // Adiciona o id do usuário ao objeto FormData
    dispatch(reset()); // Reseta os estados do userSlice
    dispatch(createPost(formData)); // Chama a função para criar uma nova foto
  };

  const handleUpdate = async (e) => {
    e.preventDefault(); // Previne o comportamento padrão do formulário
  };

  const handleCancelEdit = () => {};

  // Recupera a imagem do input, sempre que for modificada
  const handleFile = (e) => {
    const img = e.target.files[0]; // Pega a imagem do input
    setImagePost(img); // Atualiza a imagem de preview
  };

  if (loading) {
    return (
      <div id="profile">
        <div className="profile-header">
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div id="profile">
      <div className="profile-header">
        {user && user.profile_picture && (
          <>
            <img
              src={`${apiImageUser}/${user.profile_picture}`}
              alt={user.name}
            />
            <div className="profile-description">
              <h2>{user.name}</h2>
              <p>{user.bio}</p>
            </div>
          </>
        )}
      </div>
      {user && id == userLogged.id && (
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
                <span>Biografia para a foto:</span>
                <input
                  type="text"
                  placeholder="Insira uma descrição"
                  onChange={(e) => setBio(e.target.value)}
                  value={bio || ""}
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
          {messageSuccess && (
            <Message
              messages={["Postagem realizada com sucesso."]}
              type="success"
            />
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
                    src={`${apiImagePost}/${post.post_image}`}
                    alt={post.title}
                  />
                )}
                {id == userLogged.id ? (
                  <div className="actions">
                    <Link to={`/posts/${post.id}`}>
                      <BsFillEyeFill />
                    </Link>
                    <BsPencilFill onClick={() => handleEdit(post)} />
                    <BsXLg onClick={() => handleDelete(post.id)} />
                  </div>
                ) : (
                  <Link to={`/posts/${post.id}`}>
                    <BsFillEyeFill />
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
