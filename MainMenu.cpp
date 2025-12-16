

#include"MainMenu.hpp"
#include<iostream>
namespace game
{
    MainMenu::MainMenu(sf::RenderWindow &w)
    {
        _window = &w;
        if(!_font.openFromFile("../res/font/Queensides.ttf")) _window->close();
    }
    void MainMenu::renderText()
    {
        sf::Text text(_font);
        text.setString("CLICK ENTER KEY TO START");
      
        text.setFillColor(sf::Color::Red);
        auto size = _window->getSize();
        
        sf::Vector2f center{size.x/2.7f, size.y/2.1f};
        text.setPosition(center);
        _window->draw(text);
    }
    void MainMenu::start()
    {
        _window->setFramerateLimit(60);
        while(_window->isOpen())
        {
            if(is_exit_requested==true)
            {
                _window->close();
                break;
            }
            
            while(const std::optional event = _window->pollEvent()) 
            {
                if (event->is<sf::Event::Closed>())
                {
                    is_exit_requested=true;
                    _window->close();
                    break;
                }
                else if (const auto& key = event->getIf<sf::Event::KeyPressed>())
                {
                    if(key->scancode == sf::Keyboard::Scancode::Enter)
                    {
                        is_exit_requested=true;
                        _window->close();
                        break;
                    }
                }
            }
           _window->clear(sf::Color::Black);
            this->renderText();
            _window->display();
        }
    }
}
