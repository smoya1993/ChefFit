import React from "react";
import {
  AiFillGithub,
  AiFillLinkedin,
  AiFillTwitterCircle,
} from "react-icons/ai";
import { motion } from "framer-motion";
import { Logo } from "..";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="border-b-4 border-primary bg-yellow-50 pt-12 mt-24">
      {/* Footer top */}
      <div className="box flex flex-col md:flex-row  justify-between border-b-2 border-yellow-100 pb-10 gap-8">
        {/* Footer top left */}
        <div className="basis-1/2 flex flex-col gap-6 items-center md:items-start text-center md:text-start">
          <Logo />
          <p>
            Tu refugio culinario para compartir y saborear. Explora recetas,
            restaurantes y discusiones interesantes. ¡Únete a nosotros ahora y disfruta de experiencias llenas de sabor!
          </p>
        </div>
        {/* Footer top right */}
        <div className="flex gap-10 basis-1/2 justify-center md:justify-end flex-wrap md:flex-nowrap">
          {/* Footer links */}
          <ul className="flex flex-col gap-2 font-semibold mx-8 items-center md:items-start">
            <li className="text-gray-700 text-sm text-bold mb-2">Producto</li>
            <motion.li whileHover={{ x: 5 }}>
              <Link>Inicio</Link>
            </motion.li>
            <motion.li whileHover={{ x: 5 }}>
              <Link>Blog</Link>
            </motion.li>
            <motion.li whileHover={{ x: 5 }}>
              <Link>Recetas</Link>
            </motion.li>
            <motion.li whileHover={{ x: 5 }}>
              <Link>Contacto</Link>
            </motion.li>
          </ul>
          <ul className="flex flex-col gap-2 font-semibold mx-8 items-center md:items-start">
            <li className="text-gray-700 text-sm text-bold mb-2">Compañía</li>
            <motion.li whileHover={{ x: 5 }}>
              <Link>Acerca de</Link>
            </motion.li>
            <motion.li whileHover={{ x: 5 }}>
              <Link>Carreras</Link>
            </motion.li>
            <motion.li whileHover={{ x: 5 }}>
              <Link>Noticias</Link>
            </motion.li>
            <motion.li whileHover={{ x: 5 }}>
              <Link>Newsletter</Link>
            </motion.li>
          </ul>
          <ul className="flex flex-col gap-2 font-semibold mx-8 items-center md:items-start">
            <li className="text-gray-700 text-sm text-bold mb-2">Legal</li>
            <motion.li whileHover={{ x: 5 }}>
              <Link>Términos</Link>
            </motion.li>
            <motion.li whileHover={{ x: 5 }}>
              <Link>Privacidad</Link>
            </motion.li>
            <motion.li whileHover={{ x: 5 }}>
              <Link>Licencias</Link>
            </motion.li>
            <motion.li whileHover={{ x: 5 }}>
              <Link>Cookies</Link>
            </motion.li>
          </ul>
        </div>
      </div>
      {/* Footer bottom */}
      <div className="box flex justify-center sm:justify-between flex-col sm:flex-row w-full gap-4">
        <p className="text-sm text-center">
          &copy; {new Date().getFullYear()} Cheffit. Todos los derechos reservados
        </p>
        {/* Footer social links */}
        <ul className="flex justify-center gap-6 text-xl">
          <motion.li
            className="border border-primary p-1 rounded-full hover:text-gray-500"
            whileHover={{ y: -4 }}
          >
            <a
              href="https://github.com"
              aria-label="Sígueme en github"
            >
              <AiFillGithub />
            </a>
          </motion.li>
          <motion.li
            className="border border-primary p-1 rounded-full hover:text-blue-400"
            whileHover={{ y: -4 }}
          >
            <a
              href="https://twitter.com"
              aria-label="Sígueme en twitter"
            >
              <AiFillTwitterCircle />
            </a>
          </motion.li>
          <motion.li
            className="border border-primary p-1 rounded-full hover:text-blue-600"
            whileHover={{ y: -4 }}
          >
            <a
              href="https://www.linkedin.com"
              aria-label="Sígueme en linkedin"
            >
              <AiFillLinkedin />
            </a>
          </motion.li>
        </ul>
      </div>
    </footer>
  );
};

export default Footer;
