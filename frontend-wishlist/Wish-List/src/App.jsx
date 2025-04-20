import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Register from './Pages/Auth/Registr';
import Home from './Pages/Home/Home';
import WishList from './Pages/WishList/WishList';
import CreateWishList from './Pages/WishList/CreateWishList';
import InvitationConfirmation from './Pages/WishList/InvitationConfirmation';
import Login from './Pages/Auth/Login';
import Start from './Pages/Start/Start';
import ChatUsageExample from './Pages/Chat/ChatUsageExample';
import Prpfile from './Pages/Profile/Profile';

function App() {
  

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Start />} />
        <Route path="/auth/register" element={<Register />} />
        <Route path="/auth/login" element={<Login />} />
        <Route path="/wishlist/:wishListId" element={<WishList />} />
        <Route path="/create-wishlist" element={<CreateWishList />} />
        <Route path="/invitation-confirmation" element={<InvitationConfirmation />} />
        <Route path="/home" element={<Home />} />
        <Route path="/chat" element={<ChatUsageExample/>} />
        <Route path="/profile" element={<Prpfile/>} />
      </Routes>
    </Router>
  );
}

export default App;
