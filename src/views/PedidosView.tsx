interface Resource {
  type: "video" | "image";
  src: string;
}

const resources: Resource[] = [
  { type: "image", src: "/img/pedidos/pedido01.webp" },
  { type: "video", src: "/img/pedidos/pedido02.mp4" },
  { type: "video", src: "/img/pedidos/pedido03.mp4" },
  { type: "video", src: "/img/pedidos/pedido04.mp4" },
  { type: "image", src: "/img/pedidos/pedido05.webp" },
  { type: "video", src: "/img/pedidos/pedido06.mp4" },
  { type: "video", src: "/img/pedidos/pedido07.mp4" },
  { type: "image", src: "/img/pedidos/pedido08.webp" },
  { type: "image", src: "/img/pedidos/pedido09.webp" },
  { type: "video", src: "/img/pedidos/pedido10.mp4" },
  { type: "video", src: "/img/pedidos/pedido11.mp4" },
  { type: "video", src: "/img/pedidos/pedido12.mp4" },
  { type: "image", src: "/img/pedidos/pedido13.webp" },
  { type: "video", src: "/img/pedidos/pedido14.mp4" },
  { type: "image", src: "/img/pedidos/pedido15.webp" },
];

const PedidosView: React.FC = () => {

  return (
    <div>
        <div className="md:flex justify-items-center items-center mb-10 px-10 py-8 rounded-xl border-2 border-white-900">
          <video
            src={resources[1].src}
            className="w-3/4 mb-4 md:mb-0 md:w-1/5 rounded-lg shadow-lg border-2 border-white-900"
            autoPlay
            loop
            muted
          />
            <div className="flex justify-center items-center w-full">
            <img
              src={resources[0].src}
              alt="Pedido 1"
              className="w-full md:w-3/4 mb-4 md:mb-0 rounded-lg shadow-lg border-2 border-white-900" 
            />
            </div>
          <video
            src={resources[2].src}
            className="w-3/4 md:w-1/5 rounded-lg shadow-lg border-2 border-white-900"
            autoPlay
            loop
            muted
          />
        </div>
        <div className="md:flex justify-items-center items-center mb-10 px-10 py-8 rounded-xl border-2 border-white-900">
          <video
              src={resources[3].src}
              className="w-3/4 mb-4 md:mb-0 md:w-1/5 rounded-lg shadow-lg border-2 border-white-900"
              autoPlay
              loop
              muted
            />
            <div className="flex justify-center items-center w-full">
              <img
                src={resources[4].src}
                alt="Pedido 2"
                className="w-full md:w-3/4 mb-4 md:mb-0 rounded-lg shadow-lg border-2 border-white-900"
              />
            </div>
            <video
              src={resources[5].src}
              className="w-3/4 md:w-1/5 rounded-lg shadow-lg border-2 border-white-900"
              autoPlay
              loop
              muted
            />
        </div>
        <div className='mb-10'>
          <h2 className='text-4xl text-center font-bold text-[#F7F6F6]'>"La mejor calidad, al mejor precio"</h2>
        </div>
        <div className="md:flex justify-items-center items-center mb-10 px-10 py-8 rounded-xl border-2 border-white-900">
            <div className="flex justify-center items-center w-full">
              <img
                src={resources[7].src}
                alt="Pedido 3"
                className="w-full md:w-10/12 mb-4 md:mb-0  rounded-lg shadow-lg border-2 border-white-900"
              />
            </div>
          <video
              src={resources[6].src}
              className="w-3/4 md:w-1/5 mb-4 md:mb-0 rounded-lg shadow-lg border-2 border-white-900"
              autoPlay
              loop
              muted
            />
            <div className="flex justify-center items-center w-full">
              <img
                src={resources[8].src}
                alt="Pedido 4"
                className="w-full md:w-10/12 rounded-lg shadow-lg border-2 border-white-900"
              />
            </div>
        </div>
        <div className="md:flex justify-items-center md:justify-around items-center mb-10 px-10 py-8 rounded-xl border-2 border-white-900">
          <video
              src={resources[9].src}
              className="w-3/4 md:w-1/5 mb-4 md:mb-0 rounded-lg shadow-lg border-2 border-white-900"
              autoPlay
              loop
              muted
            />
            <video
              src={resources[10].src}
              className="w-3/4 md:w-1/5 mb-4 md:mb-0 rounded-lg shadow-lg border-2 border-white-900"
              autoPlay
              loop
              muted
            />
            <video
              src={resources[11].src}
              className="w-3/4 md:w-1/5 rounded-lg shadow-lg border-2 border-white-900"
              autoPlay
              loop
              muted
            />
        </div>
        <div className="md:flex justify-items-center items-center mb-10 px-10 py-8 rounded-xl border-2 border-white-900">
          <div className="flex justify-center items-center w-full">
            <img
              src={resources[12].src}
              alt="Pedido 5"
              className="w-full md:w-10/12  mb-4 md:mb-0 rounded-lg shadow-lg border-2 border-white-900"
            />
          </div>
          <video
              src={resources[13].src}
              className="w-3/4 md:w-1/5 mb-4 md:mb-0 rounded-lg shadow-lg border-2 border-white-900"
              autoPlay
              loop
              muted
            />
          <div className="flex justify-center items-center w-full">  
            <img
              src={resources[14].src}
              alt="Pedido 6"
              className="w-full md:w-10/12 rounded-lg shadow-lg border-2 border-white-900"
            />
          </div>
        </div>
    </div>
  );
};

export default PedidosView;