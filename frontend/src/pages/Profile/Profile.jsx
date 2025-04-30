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
import {
  getPostsByUserId,
  createPost,
  updatePost,
  deletePost,
  reset,
} from "../../slices/postSlice";
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
  const [idPost, setIdPost] = useState(""); // Id do post a ser editado
  const [editTitle, setEditTitle] = useState(""); // Titulo da foto editada
  const [editImage, setEditImage] = useState(""); // Imagem a ser editada
  const [editBio, setEditBio] = useState(""); // Bio a ser editada

  const dispatch = useDispatch(); // Hook do redux para executar ações

  const newPostForm = useRef(); // Referência para o formulário de novo post
  const editPostForm = useRef(); // Referência para o formulário de edição do post

  // Recupera o usuário pelo id
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
    if (posts.length == 0) {
      fetchPosts(); // Chama a função para recuperar os dados do usuário
    }
  }, [dispatch, id, posts]);

  /**
   * Gerencia a edição de um post
   * Caso seja editar um post, mostra o formulário de edição
   * Caso contrário, mostra o formulário de novo post
   * Atribui os valores do post a serem editados
   * @param {*} post - Os dados do post que está sendo editado.
   */
  const handleEdit = (post) => {
    if (post) {
      if (editPostForm.current.classList.contains("hide")) {
        hideOrShowForms();
      }

      setEditImage(post.post_image);
      setEditTitle(post.title);
      setEditBio(post.bio);
      setIdPost(post.id);
    }
  };

  /**
   * Esconde ou mostra os formulários de novo post e edição de post
   */
  const hideOrShowForms = () => {
    // Verifica se o formulário de novo post contém a classe hide
    if (newPostForm.current.classList.contains("hide")) {
      newPostForm.current.classList.remove("hide"); // Mostra o formulário de novo post
      editPostForm.current.classList.add("hide"); // Esconde o formulário de edição
    } else {
      // Se o formulário de edição contém a classe hide
      newPostForm.current.classList.add("hide"); // Esconde o formulário de novo post
      editPostForm.current.classList.remove("hide"); // Mostra o formulário de edição
    }
  };

  /**
   * Cria o método para um novo post
   * Cria um novo objeto FormData com os dados do post
   * Utiliza o serviço via post, createPost, para fazer a requisição à API
   */
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

  /**
   * Atualiza o post selecionado
   * Cria um novo objeto FormData com os dados do post
   * Utiliza o serviço via post, updatePost, para fazer a requisição à API
   */
  const handleUpdate = async (e) => {
    e.preventDefault(); // Previne o comportamento padrão do formulário
    const formData = new FormData(); // Cria um novo objeto FormData
    formData.append("_method", "PUT"); // Adiciona o metodo de inserção ao objeto FormData
    formData.append("title", editTitle); // Adiciona o título ao objeto FormData
    formData.append("bio", editBio); // Adiciona o título ao objeto FormData
    dispatch(reset()); // Reseta os estados do userSlice
    dispatch(updatePost({ id: idPost, data: formData })); // Chama a função para criar uma nova foto
  };

  /**
   * Deleta o post selecionado
   */
  const handleDelete = async (id) => {
    dispatch(reset()); // Reseta os estados do userSlice
    dispatch(deletePost(id)); // Chama a função para deletar o post
  };

  /**
   * cancela a edição do post
   * Reseta os estados do post
   * Esconde o formulário de edição
   */
  const handleCancelEdit = () => {
    setEditTitle(""); // Reseta o título do post
    setEditBio(""); // Reseta a biografia do post
    setEditImage(""); // Reseta a imagem do post
    hideOrShowForms(); // Esconde o formulário de edição
  };

  // Recupera a imagem da criação do post, sempre que for modificada
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
      {user && id == user.id && (
        <>
          {/* formulário de inclusão de novo post */}
          <div className="new-post" ref={newPostForm}>
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
          {/* forumlário de inclusão para edição de post */}
          <div className="edit-post hide" ref={editPostForm}>
            <p>Editando:</p>
            {editImage && (
              <img src={`${apiImagePost}/${editImage}`} alt={editTitle} />
            )}
            <form onSubmit={handleUpdate}>
              <label>
                <span>Titulo para a foto:</span>
                <input
                  type="text"
                  onChange={(e) => setEditTitle(e.target.value)}
                  value={editTitle || ""}
                />
              </label>
              <label>
                <span>Biografia para a foto:</span>
                <input
                  type="text"
                  placeholder="Insira uma descrição"
                  onChange={(e) => setEditBio(e.target.value)}
                  value={editBio || ""}
                />
              </label>
              <input type="submit" value="Atualizar" />
              <button className="cancel-btn" onClick={handleCancelEdit}>
                Cancelar edição
              </button>
            </form>
          </div>
          {error && <Message messages={error} type="error" />}
          {messageSuccess && (
            <Message
              messages={["Processo realizado com sucesso."]}
              type="success"
            />
          )}
        </>
      )}
      {/* Lista de posts do usuário selecionado  */}
      <div className="user-photos">
        <h2>Fotos publicadas:</h2>
        <div className="posts-container">
          {posts.length === 0 && <p>Ainda não há fotos publicadas...</p>}
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
                  <Link to={`/users/${id}/posts`}>
                    <BsFillEyeFill />
                  </Link>
                )}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default Profile;
