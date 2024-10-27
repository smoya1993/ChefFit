import React from "react";
import { AllCards, ComponentLoading } from "../../components";
import { useGetRecipesQuery } from "../../features/recipe/recipeApiSlice";
import useAuth from "../../hooks/useAuth";
import useTitle from "../../hooks/useTitle";

const index = () => {
  const { data, isLoading } = useGetRecipesQuery();
  const user = useAuth();
  useTitle("Cheffit - Mis Recetas");

  const updatedData = data?.filter((obj) => obj.author._id === user?.userId);

  return (
    <>
      {isLoading ? (
        <ComponentLoading />
      ) : (
        <AllCards
          mainTitle={"Tus Creaciones Originales"}
          tagline={
            "Bienvenido a tu espacio dedicado donde tu imaginación toma el control."
          }
          type={"recipe"}
          data={updatedData}
        />
      )}
    </>
  );
};

export default index;
