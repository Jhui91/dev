from pdf2image import convert_from_path

if __name__ == "__main__":
    path = "temp.pdf"
    input("hello")
    images = convert_from_path(path, dpi=300)
    print(images)