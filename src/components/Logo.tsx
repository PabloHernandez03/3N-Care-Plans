import { Link } from "react-router-dom"

export default function Logo() {
  return (
    <>

      <Link 
        to='/'
        className='block p-0 m-0 outline-none border-none decoration-none'
      >
        <img 
          className="ease-in-out transform hover:scale-110 p-0 m-0 border-none outline-none" 
          src="/logo.svg" 
          alt="Logotipo" 
        />
      </Link>

    </>

  )
}
