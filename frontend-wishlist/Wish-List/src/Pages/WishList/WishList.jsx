import Wish from "../../components/Wish";
import Modal from "../../Modal/Modal";
import './WishList.css';
import { useEffect, useState } from 'react';
import { fetchWish, createWish } from '../../services/wish';
import { Reorder } from 'framer-motion';
import { Link, useNavigate, useParams } from 'react-router-dom';

function WishList() {
    const [userWishLists, setUserWishLists] = useState({});
    // const [filter, setFilter] = useState({
    //     search: "",
    //     sortItem: "date",
    //     sortOrder: "desc",
    // });

    const navigate = useNavigate();
    const { wishListId } = useParams();
    const [loading, setLoading] = useState(true);
    const [selectedWish, setSelectedWish] = useState(null);
    const [modalActive, setModalActive] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            if (wishListId) {
                const userWishesData = await fetchWish(navigate, wishListId);
                setUserWishLists(userWishesData);
            } else {
                console.error("WishListId не найден в URL");
            }
            setLoading(false);
        };

        fetchData();
    }, [navigate, wishListId]);

    const handleEditWish = (id, updatedData) => {
        if (id && updatedData) {
            const updatedWishLists = { ...userWishLists };
            for (const username in updatedWishLists) {
                const userWishes = updatedWishLists[username];
                const wishIndex = userWishes.findIndex(wish => wish.id === id);
                if (wishIndex !== -1) {
                    updatedWishLists[username] = [
                        ...userWishes.slice(0, wishIndex),
                        { ...userWishes[wishIndex], ...updatedData },
                        ...userWishes.slice(wishIndex + 1)
                    ];
                    break;
                }
            }
            setUserWishLists(updatedWishLists);
        }
        setModalActive(false);
    };

    const onCreate = async (wishData) => {
        try {
            const formData = new FormData();
            formData.append("Name", wishData.name);
            formData.append("Price", wishData.price);
            formData.append("Description", wishData.description || "");
            formData.append("Link", wishData.link || "");
            if (wishData.imageFile) {
                formData.append("ImageFile", wishData.imageFile);
            }

            await createWish(formData);
            const userWishesData = await fetchWish(navigate, wishListId);
            setUserWishLists(userWishesData);
        } catch (error) {
            console.error("Ошибка при создании желания:", error.message);
        }
        setModalActive(false);
    };

    const handleEdit = (wish) => {
        setSelectedWish(wish);
        setModalActive(true);
    };

    const handleDelete = (wishId) => {
        if (wishId) {
            const updatedWishLists = { ...userWishLists };
            for (const username in updatedWishLists) {
                updatedWishLists[username] = updatedWishLists[username].filter(
                    wish => wish.id !== wishId
                );
            }
            setUserWishLists(updatedWishLists);
        }
    };

    const usernames = Object.keys(userWishLists);
    const firstUserWishes = userWishLists[usernames[0]] || [];
    const secondUserWishes = userWishLists[usernames[1]] || [];

    return (
        <div className="page-container">
            <header className="vertical-header">
                <ul className="header-menu">
                    <li><button className="buttonStyle">
                        <Link to="/home">Главная</Link>
                    </button></li>
                    <li><button className="buttonStyle">
                        <Link to="/wishlist">Wish List</Link>
                    </button></li>
                </ul>
            </header>

            <div className="content-container" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                <div style={{ width: '40%', padding: '20px' }}>
                    {usernames[0] && <h2>{usernames[0]}</h2>}
                    <Reorder.Group className="list-container" axis="y" values={firstUserWishes} onReorder={() => { }}>
                        {firstUserWishes.map((wish) => (
                            <Reorder.Item key={wish.id || `temp-${Math.random()}`} value={wish} whileDrag={{ scale: 1.1 }}>
                                <Wish
                                    id={wish.id}
                                    name={wish.name}
                                    description={wish.description}
                                    link={wish.link}
                                    price={wish.price}
                                    created={wish.created}
                                    imagePath={wish.imagePath}
                                    setSelectedWish={setSelectedWish}
                                    setModalActive={setModalActive}
                                    onDelete={handleDelete}
                                />
                            </Reorder.Item>
                        ))}
                    </Reorder.Group>
                    {firstUserWishes.length === 0 && !loading && usernames[0] && (
                        <p style={{ textAlign: 'center' }}>Список желаний пуст.</p>
                    )}
                </div>

                <div style={{ width: '20%', padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div className="center-controls">
                        <button
                            className="open-button"
                            border="1px solid gray"
                            onClick={() => {
                                setSelectedWish(null);
                                setModalActive(true);
                            }}
                        >
                            Добавить
                        </button>
                    </div>
                </div>

                <div style={{ width: '40%', padding: '20px' }}>
                    {usernames[1] && <h2>{usernames[1]}</h2>}
                    <Reorder.Group className="list-container" axis="y" values={secondUserWishes} onReorder={() => { }}>
                        {secondUserWishes.map((wish) => (
                            <Reorder.Item key={wish.id || `temp-${Math.random()}`} value={wish} whileDrag={{ scale: 1.1 }}>
                                <Wish
                                    id={wish.id}
                                    name={wish.name}
                                    description={wish.description}
                                    link={wish.link}
                                    price={wish.price}
                                    created={wish.created}
                                    imagePath={wish.imagePath}
                                    setSelectedWish={setSelectedWish}
                                    setModalActive={setModalActive}
                                    onDelete={handleDelete}
                                />
                            </Reorder.Item>
                        ))}
                    </Reorder.Group>
                    {secondUserWishes.length === 0 && !loading && usernames[1] && (
                        <p style={{ textAlign: 'center' }}>Список желаний пуст.</p>
                    )}
                </div>

                
                {loading && Object.keys(userWishLists).length === 0 && (
                    <div style={{ padding: '20px', textAlign: 'center', width: '100%', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                        <p>Загрузка желаний...</p>
                    </div>
                )}
                {Object.keys(userWishLists).length === 0 && !loading && usernames.length > 0 && (
                    <div style={{ padding: '20px', textAlign: 'center', width: '100%', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                        <p>Список желаний пуст.</p>
                    </div>
                )}
            </div>

            <Modal
                active={modalActive}
                setActive={setModalActive}
                selectedWish={selectedWish}
                onEdit={selectedWish ? handleEditWish : onCreate}
            />
        </div>
    );
}

export default WishList;