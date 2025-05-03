// Style
import "./Post.css";
// Utilitarios
import { apiImageUser } from "../../utils/config";
// components
import Message from "../../components/Message";
import { Link } from "react-router-dom";
import PostItem from "../../components/PostItem";
// hooks
import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams } from "react-router-dom";
// Redux
import { getPostById, reset, insertCommentPost } from "../../slices/postSlice";

const Post = () => {
  const { id } = useParams(); // Pega o id do post da URL
  const dispatch = useDispatch(); // Cria o dispatch para executar os métodos do slice
  const { post, loading, error } = useSelector((state) => state.post); // Pega os estados globais do slice
  const [commentText, setCommentText] = useState();

  useEffect(() => {
    // Cria o método para chamar os dados do post
    const fetchPost = async () => {
      // Chama a função para pegar o post pelo id
      dispatch(getPostById(id));
    };
    // Verifica se o post não foi carregado
    if (Object.keys(post).length === 0 || post.id != id) {
      fetchPost(); // Chama a função para pegar o post pelo id
    }
  }, [dispatch, id, post]); // Executa o useEffect quando o dispatch ou o id mudarem

  // Insert a comment
  const handleComment = (e) => {
    e.preventDefault();

    // Cria o comentário
    const formData = new FormData(); // Cria um novo objeto FormData
    formData.append("_method", "PUT"); // Adiciona o metodo de inserção ao objeto FormData
    formData.append("comment", commentText); // Adiciona o comentário ao objeto FormData
    dispatch(reset()); // Reseta os estados do userSlice
    dispatch(insertCommentPost({ id, data: formData })); // Chama a função para criar uma nova foto

    setCommentText("");
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div id="photo">
      <PostItem post={post} />
      {/* <LikeContainer photo={photo} user={user} handleLike={handleLike} /> */}
      <div className="message-container">
        {error && <Message msg={error} type="error" />}
        {/* {message && <Message msg={message} type="success" />} */}
      </div>
      <div className="comments">
        <form onSubmit={handleComment}>
          <input
            type="text"
            placeholder="Insira seu comentário..."
            onChange={(e) => setCommentText(e.target.value)}
            value={commentText || ""}
          />
          <input type="submit" value="Enviar" />
        </form>
        {!post.comments && <p>Não há comentários...</p>}
        <h3>
          Comentários ({post && !post.comments ? 0 : post.comments.length}):
        </h3>
        {post.comments && (
          <>
            {post.comments.map((comment) => (
              <div className="comment" key={comment.comment}>
                <div className="author">
                  {comment.user_image && (
                    <img
                      src={`${apiImageUser}/${comment.user_image}`}
                      alt={comment.user_name}
                    />
                  )}
                  <Link to={`/users/${comment.user_id}`}>
                    <p>{comment.user_name}:</p>
                  </Link>
                </div>
                <p>{comment.comment}</p>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
};

export default Post;
