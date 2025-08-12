"use client";

import { initTemplateLoaders } from "loader-lib";
import { templateLoaders } from "./TemplateLoader";


// Initialize global template loaders once on import
initTemplateLoaders(templateLoaders);