import "./Message.css";

const Message = ({ messages, type }) => {
  return (
    <div className={`message ${type}`}>
      {messages && (
        <ul>
          {messages.map((msg, index) => (
            <li key={index}>{msg}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Message;
