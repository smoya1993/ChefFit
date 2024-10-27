import React, { useEffect } from "react";
import { AllCards, ComponentLoading } from "../../components";
import { useDispatch } from "react-redux";
import { setRecipes } from "../../features/recipe/recipeSlice";
import { useGetRecipesQuery } from "../../features/recipe/recipeApiSlice";
import useTitle from "../../hooks/useTitle";

const Recipe = () => {
  const { data, isLoading } = useGetRecipesQuery();
  const dispatch = useDispatch();
  useTitle("Cheffit - Todas las Recetas");

  useEffect(() => {
    if (!isLoading) {
      dispatch(setRecipes(data));
    }
  }, [isLoading]);

  return (
    <>
      {isLoading ? (
        <ComponentLoading />
      ) : (
        <AllCards
          mainTitle={"Descubre Creaciones Sabrosas"}
          tagline={
            "Disfruta de una diversa colección de recetas deliciosas, curadas y compartidas por entusiastas apasionados de la comida."
          }
          type={"recipe"}
          data={data}
        />
      )}
    </>
  );
};

export default Recipe;
