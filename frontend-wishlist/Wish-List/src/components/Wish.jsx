
import moment from 'moment';
import './Wish.css'
import { deleteWish } from "../services/wish";
import { Link } from 'react-router-dom';



export default function Wish({ id, created, description, name, price, link, imagePath , setSelectedWish, setModalActive, onDelete })  {

    const handleDelete = async () => {
        try {
            console.log("Deleting wish with id:", id);
            await deleteWish(id);
            onDelete(id); 
        } catch (error) {
            alert("Не удалось удалить желание. Попробуйте позже.", error);
            console.error(error);
        }
    };



    return (
        
        <div class="w-30 h-80 bg-neutral-100 rounded-3xl text-neutral-900 p-4 flex flex-col items-start justify-center gap-3 hover:bg-gray-300 hover:shadow-2xl  transition-shadow">
            <div class="w-72 h-40  ">
                                
            <img src={imagePath } alt="Фофвфывто" className="w-[300px] h-[170px] object-cover " />
            </div>
            <div class="">
                <p class="font-extrabold">{name}</p>
                <p class="">{description}</p>
                <p class=""><Link
                    href={link}
                    className="no-underline hover:underline text-blue-700"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    ссылка
                </Link></p>
            </div>


            <div className="flex justify-between items-center w-full">
                {/* Цена */}
                <p className="text-left">{price}</p>

                {/* Кнопки */}
                <div className="flex gap-2">
                    <button className="Btn flex items-center gap-1" 
                    onClick={() => {
                        setSelectedWish({id, name, description, link, price, created }); // Устанавливаем выбранное желание
                        setModalActive(true); // Открываем модальное окно
                    }}>
                        Edit
                        <svg className="svg" viewBox="0 0 512 512">
                            <path d="M410.3 231l11.3-11.3-33.9-33.9-62.1-62.1L291.7 89.8l-11.3 11.3-22.6 22.6L58.6 322.9c-10.4 10.4-18 23.3-22.2 37.4L1 480.7c-2.5 8.4-.2 17.5 6.1 23.7s15.3 8.5 23.7 6.1l120.3-35.4c14.1-4.2 27-11.8 37.4-22.2L387.7 253.7 410.3 231zM160 399.4l-9.1 22.7c-4 3.1-8.5 5.4-13.3 6.9L59.4 452l23-78.1c1.4-4.9 3.8-9.4 6.9-13.3l22.7-9.1v32c0 8.8 7.2 16 16 16h32zM362.7 18.7L348.3 33.2 325.7 55.8 314.3 67.1l33.9 33.9 62.1 62.1 33.9 33.9 11.3-11.3 22.6-22.6 14.5-14.5c25-25 25-65.5 0-90.5L453.3 18.7c-25-25-65.5-25-90.5 0zm-47.4 168l-144 144c-6.2 6.2-16.4 6.2-22.6 0s-6.2-16.4 0-22.6l144-144c6.2-6.2 16.4-6.2 22.6 0s6.2 16.4 0 22.6z"></path>
                        </svg>
                    </button>
                    <button className="delete-btn" onClick={handleDelete}>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 69 14"
                            className="svgIcon bin-top"
                        >
                            <g clipPath="url(#clip0_35_24)">
                                <path
                                    fill="black"
                                    d="M20.8232 2.62734L19.9948 4.21304C19.8224 4.54309 19.4808 4.75 19.1085 4.75H4.92857C2.20246 4.75 0 6.87266 0 9.5C0 12.1273 2.20246 14.25 4.92857 14.25H64.0714C66.7975 14.25 69 12.1273 69 9.5C69 6.87266 66.7975 4.75 64.0714 4.75H49.8915C49.5192 4.75 49.1776 4.54309 49.0052 4.21305L48.1768 2.62734C47.3451 1.00938 45.6355 0 43.7719 0H25.2281C23.3645 0 21.6549 1.00938 20.8232 2.62734ZM64.0023 20.0648C64.0397 19.4882 63.5822 19 63.0044 19H5.99556C5.4178 19 4.96025 19.4882 4.99766 20.0648L8.19375 69.3203C8.44018 73.0758 11.6746 76 15.5712 76H53.4288C57.3254 76 60.5598 73.0758 60.8062 69.3203L64.0023 20.0648Z"
                                ></path>
                            </g>
                            <defs>
                                <clipPath id="clip0_35_24">
                                    <rect fill="white" height="14" width="69"></rect>
                                </clipPath>
                            </defs>
                        </svg>

                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 69 57"
                            className="svgIcon bin-bottom"
                        >
                            <g clipPath="url(#clip0_35_22)">
                                <path
                                    fill="black"
                                    d="M20.8232 -16.3727L19.9948 -14.787C19.8224 -14.4569 19.4808 -14.25 19.1085 -14.25H4.92857C2.20246 -14.25 0 -12.1273 0 -9.5C0 -6.8727 2.20246 -4.75 4.92857 -4.75H64.0714C66.7975 -4.75 69 -6.8727 69 -9.5C69 -12.1273 66.7975 -14.25 64.0714 -14.25H49.8915C49.5192 -14.25 49.1776 -14.4569 49.0052 -14.787L48.1768 -16.3727C47.3451 -17.9906 45.6355 -19 43.7719 -19H25.2281C23.3645 -19 21.6549 -17.9906 20.8232 -16.3727ZM64.0023 1.0648C64.0397 0.4882 63.5822 0 63.0044 0H5.99556C5.4178 0 4.96025 0.4882 4.99766 1.0648L8.19375 50.3203C8.44018 54.0758 11.6746 57 15.5712 57H53.4288C57.3254 57 60.5598 54.0758 60.8062 50.3203L64.0023 1.0648Z"
                                ></path>
                            </g>
                            <defs>
                                <clipPath id="clip0_35_22">
                                    <rect fill="white" height="57" width="69"></rect>
                                </clipPath>
                            </defs>
                        </svg>
                    </button>
                </div>
            </div>
        </div>

    );


}