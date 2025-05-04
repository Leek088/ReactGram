import "./LikeContainer.css";

import { BsHeart, BsHeartFill } from "react-icons/bs";

const LikeContainer = ({ post, userId, handleLike }) => {
  const likes = post.likes ?? [];
  return (
    <div className="like">
      {userId && (
        <>
          {likes && likes.includes(userId) ? (
            <BsHeartFill onClick={() => handleLike(post)} />
          ) : (
            <BsHeart onClick={() => handleLike(post)} />
          )}
          <p>{likes.length} like(s)</p>
        </>
      )}
    </div>
  );
};

export default LikeContainer;
