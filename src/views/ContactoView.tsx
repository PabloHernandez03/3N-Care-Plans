import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFacebook, faWhatsapp, faInstagram} from "@fortawesome/free-brands-svg-icons";
import { faEnvelope } from "@fortawesome/free-solid-svg-icons";
import fondo_titulo from '/img/fondo_titulo.svg';

export default function ContactoView() {
  return (
    <>
      <div className='text-center text-[#F7F6F6]'>
        <h1 className="text-4xl font-bold sm:p-8 sm:pt-2 inline-block"
          style={{
            backgroundImage: `url(${fondo_titulo})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            }}
        >Medios de Contacto</h1>
        <div className="grid grid-cols-1 gap-6 bg-[#050404] rounded-2xl p-10 my-16 md:mx-[180px] lg:mx-[325px] xl:mx-[425px] 2xl:mx-[525px]">
          <div className='flex justify-center py-2 gap-2 items-center'>
            <Link to="https://www.facebook.com/"
              className="transition-transform duration-300 ease-in-out transform hover:scale-110">
                <div className="flex justify-center gap-2 items-center">
                  <FontAwesomeIcon icon={faFacebook} size="3x" className='text-blue-700'/>  
                  <p className='text-xl font-bold'>Blessed Style Oficial</p>
                </div>
            </Link>
          </div>


          <div className='flex justify-center py-2 gap-2 items-center '>
            <Link to="https://wa.me/523329724459"
              className="transition-transform duration-300 ease-in-out transform hover:scale-110">
                <div className="flex justify-center gap-2 items-center">
                  <FontAwesomeIcon icon={faWhatsapp} size="3x" className=' text-green-600'/>
                  <p className='text-xl font-bold'>33 2972 4459</p>
                </div>
            </Link>
          </div>

          <div className='flex justify-center py-2 gap-2 items-center '>
            <Link to="https://www.instagram.com/blessed_style_oficial_/"
              className="transition-transform duration-300 ease-in-out transform hover:scale-110">
              <div className="flex justify-center gap-2 items-center">
                <FontAwesomeIcon icon={faInstagram} size="3x" className="bg-gradient-to-br from-pink-500 to-blue-500 rounded-2xl font-bold"/>
                <p className='text-xl font-bold'>blessed_style_oficial_</p>
              </div>
            </Link>
          </div>

          <div className='flex justify-center py-2 gap-2 items-center '>
            <Link to="mailto:blessedstyle@gmail.com"
              className="transition-transform duration-300 ease-in-out transform hover:scale-105">
                <div className="flex justify-center gap-2 items-center">
                  <FontAwesomeIcon icon={faEnvelope} size="3x"/>
                  <p className='text-xl font-bold'>bleessedstyle@gmail.com</p>
                  </div>
            </Link>
          </div>
        </div>
        <div className='py-5'>
          <h2 className='text-4xl text-center font-bold text-[#F7F6F6]'>"La mejor calidad, al mejor precio"</h2>
        </div>
      </div>
    </>
  )
}
