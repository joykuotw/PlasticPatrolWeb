import React from "react";
import { Switch, Route, Redirect } from "react-router-dom";
import linkToBrands from "./brands/link";
import BrandsRoute from "./brands/Route";
import linkToCategories from "./categories/link";
import CategoriesRoute from "./categories/Route";

export default function AdminRouter() {
  return (
    <Switch>
      <Route path={linkToCategories()}>
        <CategoriesRoute />
      </Route>
      <Route path={linkToBrands()}>
        <BrandsRoute />
      </Route>

      <Redirect to={"/"} />
    </Switch>
  );
}
