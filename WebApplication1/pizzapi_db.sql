-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Creato il: Apr 16, 2026 alle 21:23
-- Versione del server: 10.4.28-MariaDB
-- Versione PHP: 8.2.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `pizzapi_db`
--

-- --------------------------------------------------------

--
-- Struttura della tabella `ingredienti`
--

CREATE TABLE `ingredienti` (
  `id` int(11) NOT NULL,
  `nome_ingrediente` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dump dei dati per la tabella `ingredienti`
--

INSERT INTO `ingredienti` (`id`, `nome_ingrediente`) VALUES
(1, 'Pomodoro'),
(2, 'Mozzarella'),
(3, 'Basilico'),
(4, 'Salame Piccante'),
(5, 'Carciofi'),
(6, 'Funghi'),
(7, 'Prosciutto Cotto'),
(8, 'Olive Nere'),
(9, 'Gorgonzola'),
(10, 'Fontina'),
(11, 'Parmigiano'),
(12, 'Aglio'),
(13, 'Origano'),
(14, 'Mozzarella di Bufala'),
(15, 'Acciughe'),
(16, 'Capperi'),
(17, 'Verdure Grigliate'),
(18, 'Salsiccia'),
(19, 'Tonno'),
(20, 'Cipolla Rossa'),
(21, 'Frutti di Mare'),
(22, 'Wurstel'),
(23, 'Patatine Fritte'),
(24, 'Speck'),
(25, 'Brie'),
(26, 'Mortadella'),
(27, 'Pistacchio'),
(28, 'Prosciutto Crudo'),
(29, 'Rucola'),
(30, 'Nduja');

-- --------------------------------------------------------

--
-- Struttura della tabella `ingredienti_pizza`
--

CREATE TABLE `ingredienti_pizza` (
  `id` int(11) NOT NULL,
  `ingredienti` int(11) DEFAULT NULL,
  `pizza` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dump dei dati per la tabella `ingredienti_pizza`
--

INSERT INTO `ingredienti_pizza` (`id`, `ingredienti`, `pizza`) VALUES
(1, 1, 1),
(2, 2, 1),
(3, 3, 1),
(4, 1, 2),
(5, 2, 2),
(6, 4, 2),
(7, 1, 3),
(8, 2, 3),
(9, 5, 3),
(10, 6, 3),
(11, 7, 3),
(12, 8, 3),
(13, 2, 4),
(14, 9, 4),
(15, 10, 4),
(16, 11, 4),
(17, 1, 5),
(18, 2, 5),
(19, 5, 5),
(20, 6, 5),
(21, 7, 5),
(22, 8, 5),
(23, 1, 6),
(24, 12, 6),
(25, 13, 6),
(26, 1, 7),
(27, 14, 7),
(28, 3, 7),
(29, 1, 8),
(30, 2, 8),
(31, 15, 8),
(32, 16, 8),
(33, 1, 9),
(34, 2, 9),
(35, 17, 9),
(36, 2, 10),
(37, 18, 10),
(38, 6, 10),
(39, 1, 11),
(40, 2, 11),
(41, 19, 11),
(42, 20, 11),
(43, 1, 12),
(44, 12, 12),
(45, 21, 12),
(46, 1, 13),
(47, 2, 13),
(48, 7, 13),
(49, 6, 13),
(50, 1, 14),
(51, 2, 14),
(52, 22, 14),
(53, 23, 14),
(54, 2, 15),
(55, 24, 15),
(56, 25, 15),
(57, 2, 16),
(58, 26, 16),
(59, 27, 16),
(60, 1, 17),
(61, 2, 17),
(62, 28, 17),
(63, 29, 17),
(64, 11, 17),
(65, 1, 18),
(66, 2, 18),
(67, 30, 18),
(68, 20, 18),
(69, 8, 18),
(70, 2, 19),
(71, 24, 19),
(72, 25, 19),
(73, 1, 20),
(74, 2, 20),
(75, 17, 20);

-- --------------------------------------------------------

--
-- Struttura della tabella `pizza`
--

CREATE TABLE `pizza` (
  `id` int(11) NOT NULL,
  `nome_pizza` varchar(50) DEFAULT NULL,
  `img_pizza` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dump dei dati per la tabella `pizza`
--

INSERT INTO `pizza` (`id`, `nome_pizza`, `img_pizza`) VALUES
(1, 'Pizza Margherita', 'margherita.png'),
(2, 'Pizza Diavola', 'diavola.png'),
(3, 'Pizza Quattro Stagioni', 'quattro_stagioni.png'),
(4, 'Pizza Quattro Formaggi', 'quattro_formaggi.png'),
(5, 'Pizza Capricciosa', 'capricciosa.png'),
(6, 'Pizza Marinara', 'marinara.png'),
(7, 'Pizza Bufalina', 'bufalina.png'),
(8, 'Pizza Napoletana', 'napoletana.png'),
(9, 'Pizza Vegetariana', 'vegetariana.png'),
(10, 'Pizza Boscaiola', 'boscaiola.png'),
(11, 'Pizza Tonno e Cipolla', 'tonno_cipolla.png'),
(12, 'Pizza Frutti di Mare', 'frutti_di_mare.png'),
(13, 'Pizza Prosciutto e Funghi', 'prosciutto_funghi.png'),
(14, 'Pizza Americana', 'americana.png'),
(15, 'Pizza Tirolese', 'tirolese.png'),
(16, 'Pizza Pistacchio e Mortadella', 'pistacchio_mortadella.png'),
(17, 'Pizza Crudo e Rucola', 'crudo_rucola.png'),
(18, 'Pizza Calabrese', 'calabrese.png'),
(19, 'Pizza Speck e Brie', 'speck_brie.png'),
(20, 'Pizza Ortolana', 'ortolana.png');

--
-- Indici per le tabelle scaricate
--

--
-- Indici per le tabelle `ingredienti`
--
ALTER TABLE `ingredienti`
  ADD PRIMARY KEY (`id`);

--
-- Indici per le tabelle `ingredienti_pizza`
--
ALTER TABLE `ingredienti_pizza`
  ADD PRIMARY KEY (`id`),
  ADD KEY `ingredienti` (`ingredienti`),
  ADD KEY `pizza` (`pizza`);

--
-- Indici per le tabelle `pizza`
--
ALTER TABLE `pizza`
  ADD PRIMARY KEY (`id`);

--
-- Limiti per le tabelle scaricate
--

--
-- Limiti per la tabella `ingredienti_pizza`
--
ALTER TABLE `ingredienti_pizza`
  ADD CONSTRAINT `ingredienti_pizza_ibfk_1` FOREIGN KEY (`ingredienti`) REFERENCES `ingredienti` (`id`),
  ADD CONSTRAINT `ingredienti_pizza_ibfk_2` FOREIGN KEY (`pizza`) REFERENCES `pizza` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
