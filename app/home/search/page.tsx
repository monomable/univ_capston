import SearchBar from "./SearchBar"
import SearchList from "./SearchList";

const SearchPage = ({
        searchParams,
    }: {
        searchParams?: {
            query?: string;
        };
}) => {
    const query = searchParams?.query || '';
    //console.log("query", query);
    return (
        <div>
            <h1>Search Bar : </h1>
            <SearchBar />
            <SearchList query={query} />
        </div>
    )
}

export default SearchPage