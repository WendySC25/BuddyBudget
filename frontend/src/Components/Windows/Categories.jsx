//Categories.jsx
import React,{ useState, useEffect } from 'react';
import Navbar from '../NavBar/Navbar.jsx';
import CategoryForm from '../Forms/CategoryForm.jsx';
import CardList from '../Cards/CardList.jsx';
import client from '../../apiClient.jsx';

const Categories = ({ handleLogout }) => {

    const [categories, setCategories] = useState([]);
    const [categoryToEdit, setCategoryToEdit] = useState(null);
    const [showFormC, setShowFormC] = useState(false);    

    useEffect(() => {
        fetchAllC();
    }, []); // El arreglo vacío asegura que esto se ejecute solo al montar el componente, aprendí por accidente y nuestro servidor recibió 389 request ;-;
    
    useEffect(() =>{ 
        fetchAllC();
        const background = document.querySelector('.table-container');
        if (background) {
            if (showFormC) {
                background.classList.add('blurred');
            } else {
                background.classList.remove('blurred');
            }
        }

    }, [showFormC]);
    
    const fetchAllC = async () => {
        try {   
            const responseC = await client.get('/api/categories/', {
                headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` },
            });
            setCategories(responseC.data);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const handleSaveCategory = () => {
        fetchAllC()
        setShowFormC(false)
        
    };

    const handleEditCategory = (category) => {
        setCategoryToEdit(category)
        console.log('ready to edit')
        setShowFormC(true)
    }; 

    const handleSaveEditCategory = () => {
        setCategoryToEdit(null)
        setShowFormC(false)
    };

    const handleDeleteCategory = async (categoryToDelete) => {
        const endpoint = `/api/categories/${categoryToDelete.id}/`;
        try {
            await client.delete(endpoint, {
                headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` },
            });
            console.log(`Category with ID ${categoryToDelete.id} deleted  `);

            // Tengo el mismo problema que con transaciones, voy a actualiza el estado localmente eliminando la categoría
            setCategories((prevCategories) =>
                prevCategories.filter((category) => category.id !== categoryToDelete.id)
            );

        } catch (error) {
            console.error('Error deleting category:', error);
        }
    };

    return(
    <div className="home">
        <Navbar handleLogout={handleLogout} />
        <h1> Categories </h1>

        <CardList 
            categories = {categories}
            onDeleteCategory   = {handleDeleteCategory}
            onEditCategory     = {handleEditCategory}
            // onSaveEditCategory = {handleSaveEditCategory}
        />

        {showFormC && <CategoryForm
                        onSaveCategory ={handleSaveCategory}
                        categoryToEdit = {categoryToEdit}
                    />
        }

    </div>

    );

}

export default Categories;