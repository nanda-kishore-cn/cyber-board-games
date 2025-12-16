/*
 *  This Header helps define the Window with which we are working

*/

#ifndef BS_MAIN_MENU
#define BS_MAIN_MENU

#include<SFML/graphics.hpp>

namespace game
{

class MainMenu
{
    public:
        MainMenu(sf::RenderWindow &w);
        void start();
    

    private:
        sf::RenderWindow* _window;
        sf::Font _font;
        void renderText();
        bool is_exit_requested = false;
};

} 

#endif