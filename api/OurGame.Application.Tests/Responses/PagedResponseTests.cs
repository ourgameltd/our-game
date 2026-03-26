using OurGame.Application.Abstractions.Responses;

namespace OurGame.Application.Tests.Responses;

public class PagedResponseTests
{
    [Fact]
    public void Create_SetsAllProperties()
    {
        var items = new List<string> { "a", "b", "c" };

        var response = PagedResponse<string>.Create(items, 2, 10, 25);

        Assert.Equal(items, response.Items);
        Assert.Equal(2, response.PageNumber);
        Assert.Equal(10, response.PageSize);
        Assert.Equal(25, response.TotalCount);
    }

    [Fact]
    public void TotalPages_CalculatesCorrectly()
    {
        var response = PagedResponse<string>.Create(new List<string>(), 1, 10, 25);

        Assert.Equal(3, response.TotalPages);
    }

    [Fact]
    public void TotalPages_ExactDivision()
    {
        var response = PagedResponse<string>.Create(new List<string>(), 1, 10, 20);

        Assert.Equal(2, response.TotalPages);
    }

    [Fact]
    public void HasPreviousPage_FirstPage_ReturnsFalse()
    {
        var response = PagedResponse<string>.Create(new List<string>(), 1, 10, 25);

        Assert.False(response.HasPreviousPage);
    }

    [Fact]
    public void HasPreviousPage_SecondPage_ReturnsTrue()
    {
        var response = PagedResponse<string>.Create(new List<string>(), 2, 10, 25);

        Assert.True(response.HasPreviousPage);
    }

    [Fact]
    public void HasNextPage_LastPage_ReturnsFalse()
    {
        var response = PagedResponse<string>.Create(new List<string>(), 3, 10, 25);

        Assert.False(response.HasNextPage);
    }

    [Fact]
    public void HasNextPage_NotLastPage_ReturnsTrue()
    {
        var response = PagedResponse<string>.Create(new List<string>(), 1, 10, 25);

        Assert.True(response.HasNextPage);
    }
}
