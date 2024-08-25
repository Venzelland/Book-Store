import React, {useState, useEffect, useRef, useCallback, memo} from 'react';
import "./styles.css"

const BookItem = memo(({book}) => (
    <li key={book.title}>
        <div style={{marginBottom: '10px'}}><strong>Название:</strong> {book.title}</div>
        <div><strong>Автор:</strong> {book.author}</div>
        <div><strong>Цена:</strong> ${book.price}</div>
        <div><strong>Дата:</strong> {book.date}</div>
        <div style={{paddingTop: '5px', borderTop: '1px solid rgba(224, 224, 224, 0.34)'}}>
            <strong>Теги:</strong> {book.tags.join(', ')}</div>
    </li>
));

const TagFilterOptions = memo(({availableTags, selectedTags, toggleTag}) => (
    <div className="tag-filter-options">
        {availableTags.map((tag) => (
            <span
                key={tag}
                className={`tag ${selectedTags.includes(tag) ? 'selected' : ''}`}
                onClick={(event) => toggleTag(event, tag)}
            >
                {tag}
            </span>
        ))}
    </div>
));

const BookStore = () => {
    const booksData = [
        {
            title: "Plastic: A Novel",
            author: "Scott Guild",
            date: "February 2024",
            price: 420,
            tags: ["Climate change", "Sci-Fi"],
        },
        {
            title: "Space Oddities: The Mysterious Anomalies Challenging Our Understanding of the Universe",
            author: "Harry Cliff",
            date: "March 2024",
            price: 542,
            tags: ["Climate change", "History"],
        },
        {
            title: "H Is for Hope: Climate Change from A to Z",
            author: "Elizabeth Kolbert",
            illustrator: "Wesley Allsbrook",
            date: "March 2024",
            price: 674,
            tags: ["Climate change", "Technology"],
        },
        {
            title: "The Exquisite Machine: The New Science of the Heart",
            author: "Sian E. Harding",
            date: "February 2024",
            price: 981,
            tags: ["Health", "Biochemistry"],
        },
    ];

    const [books, setBooks] = useState(booksData);
    const [sortType, setSortType] = useState('');
    const [isAscending, setIsAscending] = useState(true);
    const [selectedTags, setSelectedTags] = useState([]);
    const [availableTags, setAvailableTags] = useState([]);
    const [isTagFilterOpen, setIsTagFilterOpen] = useState(false);

    const tagFilterRef = useRef(null);
    const buttonRef = useRef(null);

    useEffect(() => {
        const savedTags = sessionStorage.getItem('selectedTags');
        if (savedTags) {
            setSelectedTags(JSON.parse(savedTags));
        }
    }, []);

    useEffect(() => {
        sessionStorage.setItem('selectedTags', JSON.stringify(selectedTags));
        filterBooksByTags();
    }, [selectedTags]);

    useEffect(() => {
        if (booksData && booksData.length > 0) {
            const tags = Array.from(new Set(booksData.flatMap((book) => book.tags)));
            setAvailableTags(tags);
        }
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                tagFilterRef.current && !tagFilterRef.current.contains(event.target) &&
                buttonRef.current && !buttonRef.current.contains(event.target)
            ) {
                setIsTagFilterOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const sortBooks = (type, asc, books) => {
        const sortedBooks = [...books].sort((a, b) => {
            if (type === 'price') {
                if (a.price === b.price) {
                    return asc ? a.author.localeCompare(b.author) : b.author.localeCompare(a.author);
                }
                return asc ? a.price - b.price : b.price - a.price;
            } else if (type === 'author') {
                return asc ? a.author.localeCompare(b.author) : b.author.localeCompare(a.author);
            } else if (type === 'date') {
                return asc
                    ? new Date(a.date) - new Date(b.date)
                    : new Date(b.date) - new Date(a.date);
            }
            return 0;
        });
        setBooks(sortedBooks);
    };

    const handleSort = useCallback((type) => {
        const ascending = type === sortType ? !isAscending : true;
        setSortType(type);
        setIsAscending(ascending);
        sortBooks(type, ascending, books);
    }, [sortType, isAscending, books]);

    const toggleTag = useCallback((event, tag) => {
        event.stopPropagation();
        setSelectedTags((prevTags) =>
            prevTags.includes(tag)
                ? prevTags.filter((t) => t !== tag)
                : [...prevTags, tag]
        );
    }, []);

    const filterBooksByTags = () => {
        if (selectedTags.length === 0) {
            setBooks(booksData);
        } else {
            const filteredBooks = booksData.filter((book) =>
                selectedTags.every((tag) => book.tags.includes(tag))
            );
            setBooks(filteredBooks);
        }
    };

    const resetTags = () => {
        setSelectedTags([]);
        setSortType('');
        setIsAscending(true);
        setIsTagFilterOpen(false);
    };

    const toggleTagFilter = (event) => {
        event.stopPropagation();
        setIsTagFilterOpen(prevState => !prevState);
    };

    const calculateTotalPrice = () => {
        return books.reduce((total, book) => total + book.price, 0);
    };

    return (
        <div className="container">
            <h1>Book Store</h1>
            <div className="sort-options">
                <span
                    className={`sort-option ${sortType === 'price' ? 'active' : ''}`}
                    onClick={() => handleSort('price')}
                >
                    Цена <span className={`arrow ${sortType === 'price' && isAscending ? 'asc' : ''}`}>&#9660;</span>
                </span>
                <span
                    className={`sort-option ${sortType === 'author' ? 'active' : ''}`}
                    onClick={() => handleSort('author')}
                >
                    Автор <span className={`arrow ${sortType === 'author' && isAscending ? 'asc' : ''}`}>&#9660;</span>
                </span>
                <span
                    className={`sort-option ${sortType === 'date' ? 'active' : ''}`}
                    onClick={() => handleSort('date')}
                >
                    Дата <span className={`arrow ${sortType === 'date' && isAscending ? 'asc' : ''}`}>&#9660;</span>
                </span>
                <span
                    className="sort-option"
                    onClick={toggleTagFilter}
                    ref={buttonRef}
                >
                    Выберите теги <span className={`arrow ${isTagFilterOpen ? 'asc' : ''}`}>&#9660;</span>
                    {isTagFilterOpen && (
                        <TagFilterOptions
                            availableTags={availableTags}
                            selectedTags={selectedTags}
                            toggleTag={toggleTag}
                        />
                    )}
                </span>
                <span className="sort-option reset" onClick={resetTags}>
                    Сбросить теги
                </span>
            </div>

            <ul className="books-list">
                {books.map((book) => (
                    <BookItem key={book.title} book={book} />
                ))}
                <div className="total-price">
                    <strong>TOTAL PRICE: $</strong> {calculateTotalPrice()}
                </div>
            </ul>
        </div>
    );
};

export default BookStore;
