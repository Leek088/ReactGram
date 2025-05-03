// Estilo
import "./PostItem.css";
// Utilitarios
import { apiImagePost } from "../utils/config";

import { Link } from "react-router-dom";

const PostItem = ({ post }) => {
  return (
    <div className="photo-item">
      {post.post_image && (
        <img src={`${apiImagePost}/${post.post_image}`} alt={post.title} />
      )}
      <h2>{post.title}</h2>
      <p className="photo-author">
        Publicada por:{" "}
        <Link to={`/users/${post.user_id}/posts`}>{post.user_name}</Link>
      </p>
    </div>
  );
};

export default PostItem;
