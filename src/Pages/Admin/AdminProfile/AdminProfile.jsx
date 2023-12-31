import { Button } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import { useState } from "react";
import useCurrentUser from "../../../hooks/useCurrentUser";
import ProfileModal from '../../../Components/Shared/Modals/ProfileModal'
import { Helmet } from "react-helmet-async";
const AdminProfile = () => {

  <Helmet>
  <title>Profile</title>
</Helmet>;
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const { data: currentUser, refetch } = useCurrentUser();

  return (
    <div className="bg-gray-200 font-sans h-screen w-full flex flex-row justify-center items-center">
      <div className="card w-96 mx-auto bg-white  shadow-xl hover:shadow">
        <img
          className="w-32 mx-auto rounded-full -mt-20 border-8 border-white"
          src={currentUser?.logo}
        />
        <div className="text-center mt-2 text-3xl font-medium">
          {currentUser?.name}
        </div>
        <div className="text-center mt-2 font-light text-sm">
          Email: {currentUser?.email}
        </div>
        <div className="text-center mt-2 font-light text-sm">
          Date of Birth: {currentUser?.dob}
        </div>
        <hr className="mt-8" />
        <div className="m-5 ">
          <Button
            onClick={() => handleOpen()}
            sx={{ width: "100%" }}
            variant="contained"
            endIcon={<EditIcon />}
          >
            Update Profile
          </Button>
        </div>
      </div>
      <ProfileModal
        profile={currentUser}
        refetch={refetch}
        open={open}
        handleClose={handleClose}
      ></ProfileModal>
    </div>
  );
};

export default AdminProfile;
