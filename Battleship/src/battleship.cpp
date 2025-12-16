#include"ui/MainMenu.hpp"

int main()
{
    sf::RenderWindow window(sf::VideoMode({1800, 1000}), "Battleship", sf::Style::Close);
    game::MainMenu menu(window);
    menu.start();
    return 0;
}
