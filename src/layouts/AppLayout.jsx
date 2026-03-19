import { Outlet } from 'react-router-dom';
import NavMenu from '@/components/shared/NavMenu';

export default function AppLayout() {
    return (
        <div>
            <header className="p-5 py-4 fixed bottom-0 left-0 right-0 lg:static lg:bottom-auto z-10">
                <div className="max-w-screen-2xl lg:mx-auto flex flex-row justify-center lg:justify-end items-center">
                    {/* <div className="hidden lg:block w-32"> */}
                        {/* <Logo /> */}
                    </div>
                    <NavMenu />
                </div>
            </header>

            <section
                className="max-w-screen-2xl mx-auto p-5 py-8 pb-[6.5rem] xl:pb-8 z-0"
            >
                <Outlet />
            </section>
        </div>
    );
}