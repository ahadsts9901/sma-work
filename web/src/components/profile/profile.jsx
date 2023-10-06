import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import './profile.css';
import { UserPost } from '../userPost/userPost';
import { useNavigate, useParams } from 'react-router-dom';
import { GlobalContext } from '../../context/context';
import { PencilFill } from 'react-bootstrap-icons'

const Profile = () => {

  let { state, dispatch } = useContext(GlobalContext);

  const [userPosts, setUserPosts] = useState([]);
  const [profile, setProfile] = useState([]);

  const userId = state.user.userId
  const { userParamsId } = useParams()

  useEffect(() => {
    renderCurrentUserPost();
    getProfile()
  }, [userId, userParamsId]);

  const renderCurrentUserPost = () => {
    axios.get(`/api/v1/posts/${userId}`)
      .then((response) => {
        // Handle the data returned from the API
        const userAllPosts = response.data;
        // console.log(userAllPosts)
        setUserPosts(userAllPosts)
        // This will contain the posts for the specified email
      })
      .catch((error) => {
        // Handle any errors that occurred during the request
        console.error('Axios error:', error);
      });
  };

  const getProfile = async () => {
    try {
      const response = await axios.get(`/api/v1/profile/${userParamsId || ""}`);
      console.log(response.data);
      setProfile(response.data);
    } catch (error) {
      console.log(error.data);
    }
  }

  const deletePost = (postId) => {
    Swal.fire({
      title: 'Delete Post',
      text: 'Are you sure you want to delete this post?',
      icon: 'warning',
      showCancelButton: true,
      cancelButtonText: 'Cancel',
      confirmButtonText: 'Delete',
      showConfirmButton: true,
      confirmButtonColor: "#284352",
      showCancelButton: true,
      cancelButtonColor: "#284352",
      showLoaderOnConfirm: true,
      preConfirm: async () => {
        try {
          const response = await axios.delete(`/api/v1/post/${postId}`);
          // console.log(response.data);
          Swal.fire({
            icon: 'success',
            title: 'Post Deleted',
            timer: 1000,
            showCancelButton: false,
            showConfirmButton: false
          });
          renderCurrentUserPost();
        } catch (error) {
          console.log(error.data);
          Swal.fire({
            icon: 'error',
            title: 'Failed to delete post',
            text: error.data,
            showConfirmButton: false
          });
        }
      }
    });
  }

  function editPost(postId) {
    axios.get(`/api/v1/post/${postId}`)
      .then(response => {
        const post = response.data;

        Swal.fire({
          title: 'Edit Post',
          html: `
            <textarea id="editText" class="swal2-input text" placeholder="Post Text" required>${post.text}</textarea>
          `,
          showCancelButton: true,
          cancelButtonText: 'Cancel',
          confirmButtonText: 'Update',
          showConfirmButton: true,
          confirmButtonColor: "#284352",
          showCancelButton: true,
          cancelButtonColor: "#284352",
          showLoaderOnConfirm: true,
          preConfirm: () => {

            const editedText = document.getElementById('editText').value;

            if (!editedText.trim()) {
              Swal.showValidationMessage('Title and text are required');
              return false;
            }

            return axios.put(`/api/v1/post/${postId}`, {
              text: editedText
            })
              .then(response => {
                // console.log(response.data);
                Swal.fire({
                  icon: 'success',
                  title: 'Post Updated',
                  timer: 1000,
                  showConfirmButton: false
                });
                renderCurrentUserPost();
              })
              .catch(error => {
                // console.log(error.response.data);
                Swal.fire({
                  icon: 'error',
                  title: 'Failed to update post',
                  text: error.response.data,
                  showConfirmButton: false
                });
              });
          }
        });
      })
      .catch(error => {
        // console.log(error.response.data);
        Swal.fire({
          icon: 'error',
          title: 'Failed to fetch post',
          text: error.response.data,
          showConfirmButton: false
        });
      });
  }


  const logOut = (event) => {
    event.preventDefault();

    Swal.fire({
      title: 'Logout',
      text: 'Are you sure you want to log out?',
      icon: 'warning',
      showCancelButton: true,
      cancelButtonText: 'Cancel',
      confirmButtonText: 'Log Out',
      confirmButtonColor: '#284352',
      cancelButtonColor: '#284352',
      showLoaderOnConfirm: true,
      preConfirm: () => {
        // Handle the logout logic here
        return axios
          .post(`/api/v1/logout`, {})
          .then(function (response) {
            dispatch({
              type: 'USER_LOGOUT',
            });

            window.location.pathname = '/login';
            return true;
          })
          .catch(function (error) {
            Swal.fire({
              icon: 'error',
              title: "Can't logout",
              timer: 1000,
              showConfirmButton: false,
            });
            return false;
          });
      },
    });
  };


  return (
    <div className='posts'>

      <div className="profile">
        <img className='profileIMG' src="https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png" />

        <h2 className='profileName'><PencilFill className='editName' /> </h2>

        <button className='logOutButton' onClick={logOut}>Log Out</button>
        <div className='profileImageContainer'>
          <label className='editIMG' htmlFor="profileImage"><PencilFill /></label>
          <input type="file" className="file hidden" id="profileImage" accept="image/*"></input>
        </div>
      </div>

      <div className="result">
        {!userPosts ? <h2 className="noPostMessage">No Post Found</h2> : (userPosts.length === 0 ? (
          <div className="loadContainer"><span class="loader"></span></div>
        ) : (
          userPosts.map((post, index) => (
            <UserPost key={index} title={post.title} text={post.text} time={post.time} postId={post._id} del={deletePost} edit={editPost} />
          ))
        ))}
      </div>
    </div>
  );
};

export default Profile